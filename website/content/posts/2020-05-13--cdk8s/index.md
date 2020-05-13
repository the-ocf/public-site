---
title: cdk8s, the Cloud Development Kit for Kubernetes
description: The AWS Cloud Development Kit is available for generating Kubernetes resource definitions
author: Matthew Bonig @mattbonig
tags: ["cdks","kubernetes"]
---

## Bringing the CDK to other platforms

The Cloud Development Kit drastically changed how Infrastructure as Code is developed in large organizations.
 Infrastructure rules can easily be defined within constructs and distributed for use to multiple teams.
 That kind of power wasn't going to remain an exclusive tool of AWS.

Today at the CNCF Member Webinar the AWS Team responsible for the CDK unveiled the cdk8s!

Check it out at [Github](https://github.com/awslabs/cdk8s) and join the [Slack](https://join.slack.com/t/cdk8s/shared_invite/enQtOTY0NTMzMzY4MjU3LWMyYzM2ZmQzOTAyZjAzY2E5MGNjNmJlMDgwZWQwM2M0YTAwMTE5MmE3ZGM3OWY2N2ZkYjQ3NjBkOWYwMDg0ZWU).

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

While there is a lot of complexity and sophistication, it's not exactly readable and manageable.
 It has a steep learning curve and can be painful to debug. It violates most of the good principles found in [SOLID](https://en.wikipedia.org/wiki/SOLID) and [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

## Example

First, a simple microservice is defined, consisting of a Service and Deployment.

```typescript
import { Construct, Node } from 'constructs';
import { Deployment, Service, IntOrString } from './imports/k8s';

export interface WebServiceOptions {
  /** The Docker image to use for this service. */
  readonly image: string; // docker image to use for this service

  /**
   * Number of replicas.
   * @default 1
   */
  readonly replicas?: number;

  /**
   * External port.
   * @default 80
   */
  readonly port?: number;

  /**
   * Internal port.
   * @default 8080
   */
  readonly containerPort?: number;
}

export class WebService extends Construct {
  constructor(scope: Construct, ns: string, options: WebServiceOptions) {
    super(scope, ns);

    const port = options.port || 80;
    const containerPort = options.containerPort || 8080;
    const label = { app: Node.of(this).uniqueId };
    const replicas = options.replicas ?? 1;

    new Service(this, 'service', {
      spec: {
        type: 'LoadBalancer',
        ports: [ { port, targetPort: IntOrString.fromNumber(containerPort) } ],
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
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'web',
                image: options.image,
                ports: [ { containerPort } ]
              }
            ]
          }
        }
      }
    });
  }
}
```

Then that construct can be used in a 'Chart':

```
import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';
import { WebService } from './web-service';

class MyChart extends Chart {
  constructor(scope: Construct, ns: string) {
    super(scope, ns);

    new WebService(this, 'hello', {
      image: 'paulbouwer/hello-kubernetes:1.7',
      replicas: 2
    });

    new WebService(this, 'ghost', {
      image: 'ghost',
      containerPort: 2368,
    });
  }
}

const app = new App();
new MyChart(app, 'web-service-example');
app.synth();
```

Just like the AWS CDK!

Check it out at [Github](https://github.com/awslabs/cdk8s) and join the [Slack](https://join.slack.com/t/cdk8s/shared_invite/enQtOTY0NTMzMzY4MjU3LWMyYzM2ZmQzOTAyZjAzY2E5MGNjNmJlMDgwZWQwM2M0YTAwMTE5MmE3ZGM3OWY2N2ZkYjQ3NjBkOWYwMDg0ZWU).

Happy constructing!
