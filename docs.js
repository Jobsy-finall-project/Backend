module.exports = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Jobsy API",
            version: "1.0.0",
            description: "the api of Jobsy",
            termsOfService: "http://example.com/terms/",
            contact: {
                name: "API Support",
                url: "http://www.exmaple.com/support",
                email: "support@example.com",
            },
        },

        servers: [
            {
                url: "http://localhost:3900",
                description: "My API Documentation",
            },
        ],
    },
    apis: ["./routes/*.js"],
};
