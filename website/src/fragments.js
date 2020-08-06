/* eslint-disable */

// Intent behind this file is to prevent hidden dependencies.
// Put fragments here in cases you have to use the same query fragment
// in several different queries. This way you can't accidentally
// modify queries in a way that they become inconsistent.

const blogPostTeaserFields = `
    edges {
        node {
            id
            excerpt(pruneLength: 200)
            fields {
                slug
                prefix
                source
            }
            frontmatter {
                title
                tags
                author
                image{
                  publicURL
                }
            }
        }
    }
`

const blogPostSort = `
    sort: { fields: [fields___prefix, fields___slug] order: DESC }
`

module.exports = {
    blogPostTeaserFields: blogPostTeaserFields,
    blogPostSort: blogPostSort
};
