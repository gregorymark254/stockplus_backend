const router = require("express").Router()
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Stock Plus Api',
            version: '1.0.0',
            description: 'Stock Plus Backend server'
        },
        servers: [
            {
                url: 'http://localhost:4500'
            }
        ],
        paths: {
            '/api': {
                get: {
                    tags: ['Api'],
                    summary: 'get method for backend server',
                    description: 'Returns message to check if the server is running',
                    responses: {
                        '200': {
                            description: 'A successful response'
                        },
                        '404': {
                            description: 'Error, Not Found!'
                        }
                    }
                }
            },
            '/api/v1/register': {
                post: {
                    tags: ['Users'],
                    summary: 'Register',
                    description: 'Returns message to register a new user',
                    responses: {
                        '200': {
                            description: 'A successful response'
                        },
                        '404': {
                            description: 'Error, Not Found!'
                        }
                    }
                }
            },
            '/api/v1/login': {
                post: {
                    tags: ['Users'],
                    summary: 'Login',
                    description: 'Returns message to login a new user',
                    responses: {
                        '200': {
                            description: 'A successful response'
                        },
                        '404': {
                            description: 'Error, Not Found!'
                        }
                    }
                }
            }
        },
        components: {
            schemas: {
                EmailAndPassword: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        password: {
                            type: 'string',
                            format: 'password'
                        }
                    },
                    required: ['email', 'password']
                }
            },
            securitySchemes: {
                OAuth2PasswordBearer: {
                    type: 'oauth2',
                    flows: {
                        password: {
                            tokenUrl: '/api/v1/login',
                            scopes: {}
                        }
                    }
                }
            }
        },
        security: [
            {
                OAuth2PasswordBearer: []
            }
        ]
    },
    apis: ['./Swagger.js']
};


const swaggerSpec = swaggerJSDoc(options)
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

module.exports = router