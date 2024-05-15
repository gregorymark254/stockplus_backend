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
                url: 'https://stockplus-backend.vercel.app'
            }
        ],
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
    apis: ['./Routes/*', './Server.js']
};

module.exports = options