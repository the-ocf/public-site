---
title: "The cdk8s, the AWS CDK for Kubernetes"
description: The AWS Cloud Development Kit is available for generating Kubernetes resource definitions
---

## Bringing the CDK to other platforms

The Cloud Development Kit drastically changed how Infrastructure as Code in large organizations is developed.
 Infrastructure rules can easily be defined within constructs and distributed for use. 
 That kind of power wasn't going to remain an exclusive tool of AWS.
  
The AWS Cloud Development Kit is now available for Kubernetes! 

### But don't we have Helm?

Helm is the standard tool on Kubernetes to manage more complex resource definitions. 
Based in Go and leveraging its powerful templating language means you take your existing yaml files 
and decorate them with Go templating code. 
You can create some massively complex and powerful definitions.

Here is a RabbitMQ Helm template file that defines just the StatefulSet portion of the deploy:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ template "rabbitmq.fullname" . }}
  labels:
    app: {{ template "rabbitmq.name" . }}
    chart: {{ template "rabbitmq.chart" .  }}
    release: "{{ .Release.Name }}"
    heritage: "{{ .Release.Service }}"
spec:
  serviceName: {{ template "rabbitmq.fullname" . }}-headless
  podManagementPolicy: {{ .Values.podManagementPolicy }}
  replicas: {{ .Values.replicas }}
  updateStrategy:
    type: {{ .Values.updateStrategy.type }}
    {{- if (eq "Recreate" .Values.updateStrategy.type) }}
    rollingUpdate: null
    {{- end }}

  ... 10 lines later...

      {{- if .Values.podLabels }}
{{ toYaml .Values.podLabels | indent 8 }}
      {{- end }}
    
    ... 30 lines later ...
    
       initContainers:
      - name: volume-permissions
        image: "{{ template "rabbitmq.volumePermissions.image" . }}"
        imagePullPolicy: {{ default "" .Values.volumePermissions.image.pullPolicy | quote }}
        command: ["/bin/chown", "-R", "{{ .Values.securityContext.runAsUser }}:{{ .Values.securityContext.fsGroup }}", "{{ .Values.persistence.path }}"]
        securityContext:
          runAsUser: 0
        resources:
{{ toYaml .Values.volumePermissions.resources | indent 10 }}
        volumeMounts:
        - name: data
          mountPath: "{{ .Values.persistence.path }}"
      {{- end }}
      containers:
      - name: rabbitmq
        image: {{ template "rabbitmq.image" . }}
        imagePullPolicy: {{ .Values.image.pullPolicy | quote }}
        command:
         - bash
         - -ec
         - |
            mkdir -p /opt/bitnami/rabbitmq/.rabbitmq/
            mkdir -p /opt/bitnami/rabbitmq/etc/rabbitmq/
            touch /opt/bitnami/rabbitmq/var/lib/rabbitmq/.start
            #persist the erlang cookie in both places for server and cli tools
            echo $RABBITMQ_ERL_COOKIE > /opt/bitnami/rabbitmq/var/lib/rabbitmq/.erlang.cookie
            cp /opt/bitnami/rabbitmq/var/lib/rabbitmq/.erlang.cookie /opt/bitnami/rabbitmq/.rabbitmq/
            #change permission so only the user has access to the cookie file
            chmod 600 /opt/bitnami/rabbitmq/.rabbitmq/.erlang.cookie /opt/bitnami/rabbitmq/var/lib/rabbitmq/.erlang.cookie
            #copy the mounted configuration to both places
            cp  /opt/bitnami/rabbitmq/conf/* /opt/bitnami/rabbitmq/etc/rabbitmq
            # Apply resources limits
            {{- if .Values.rabbitmq.setUlimitNofiles }}
            ulimit -n "${RABBITMQ_ULIMIT_NOFILES}"
            {{- end }}
            #replace the default password that is generated
            sed -i "/CHANGEME/cdefault_pass=${RABBITMQ_PASSWORD//\\/\\\\}" /opt/bitnami/rabbitmq/etc/rabbitmq/rabbitmq.conf
            {{- if and .Values.persistence.enabled .Values.forceBoot.enabled }}
            if [ -d "{{ .Values.persistence.path }}/mnesia/${RABBITMQ_NODENAME}" ]; then rabbitmqctl force_boot; fi
            {{- end }}
            exec rabbitmq-server
        {{- if .Values.resources }}
   
   ... 250 lines later ...
   
  {{- else }}
  volumeClaimTemplates:
    - metadata:
        name: data
        labels:
          app: {{ template "rabbitmq.name" . }}
          release: "{{ .Release.Name }}"
          heritage: "{{ .Release.Service }}"
      spec:
        accessModes:
          - {{ .Values.persistence.accessMode | quote }}
        resources:
            requests:
              storage: {{ .Values.persistence.size | quote }}
        {{ include "rabbitmq.storageClass" . }}
  {{- end }}

```

While there is a lot of complexity and sophistication, it's not exactly readable and managable.
 It has a steep learning curve and can be painful to debug. It violates most of the good principles found in [SOLID](https://en.wikipedia.org/wiki/SOLID) and [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

## Example

In this example, a simple microservice is defined. 

```typescript
import { Construct } from '@aws-cdk/core';
import { App, Chart } from 'cdk8s';

// import generated constructs
import { Service, IntOrString } from './.gen/service-v1';
import { Deployment } from './.gen/apps-deployment-v1';

class MyChart extends Chart {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const label = { app: 'hello-k8s' };

    new Service(this, 'service', {
      spec: {
        type: 'LoadBalancer',
        ports: [ { port: 80, targetPort: IntOrString.fromNumber(8080) } ],
        selector: label
      }
    });

    new Deployment(this, 'deployment', {
      spec: {
        replicas: 2,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'hello-kubernetes',
                image: 'paulbouwer/hello-kubernetes:1.5',
                ports: [ { containerPort: 8080 } ]
              }
            ]
          }
        }
      }
    });
  }
}

const app = new App();
new MyChart(app, 'hello');
app.synth();
```

We can also take this code and refactor it slightly, creating a new custom construct that enforces some business logic.

```typescript
import {Construct} from '@aws-cdk/core';
import {App, Chart} from 'cdk8s';
// import generated constructs
import {IntOrString, Service} from './.gen/service-v1';
import {Deployment} from './.gen/apps-deployment-v1';


interface MicroserviceProps {
    image: string;
    label: any;
    ports: any[];
    replicas?: number;
}

class Microservice extends Construct {

    constructor(scope: Construct, name: string, props: MicroserviceProps) {
        super(scope, name);
        let {ports, label, replicas, image} = {replicas: 2, ...props};
        new Service(this, 'service', {
            spec: {
                type: 'LoadBalancer',
                ports: ports.map(port => ({port: 80, targetPort: IntOrString.fromNumber(port.containerPort)})),
                selector: label
            }
        });

        new Deployment(this, 'deployment', {
            spec: {
                replicas,
                selector: {
                    matchLabels: label
                },
                template: {
                    metadata: {labels: label},
                    spec: {
                        containers: [
                            {
                                name: `${name}`,
                                image: image,
                                ports: ports
                            }
                        ]
                    }
                }
            }
        });
    }
}

class MyChart extends Chart {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        new Microservice(this, `${name}-microservice`, {
            image: 'paulbouwer/hello-kubernetes:1.5',
            label: {app: 'hello-k8s'},
            ports: [{containerPort: 8080}]
        });
    }
}

const app = new App();
new MyChart(app, 'hello');
app.synth();
```

Now there is a Microservice construct that can be distributed to any number of different teams. 

## Current State

As of this writing (March 2020) the cdk8s is still in pre-release and should be used with caution. Many changes are likely coming that could be breaking-changes to any code you write with the cdk8s.
