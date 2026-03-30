#:sdk Aspire.AppHost.Sdk@13.2.0
#:package Aspire.Hosting.JavaScript@13.2.0
#:package Aspire.Hosting.Python@13.2.0

var builder = DistributedApplication.CreateBuilder(args);

// API — Express.js / TypeScript backend
var api = builder.AddJavaScriptApp("api", "./src/api")
    .WithHttpHealthCheck("/health");

// Web — Next.js frontend
builder.AddJavaScriptApp("web", "./src/web")
    .WithHttpEndpoint(port: 3001, env: "PORT")
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WaitFor(api);

// Docs — MkDocs documentation server
// mkdocs binds to internal port 8201; Aspire proxies 8200 → 8201
builder.AddPythonExecutable("docs", ".", "mkdocs")
    .WithArgs("serve", "--dev-addr", "0.0.0.0:8201")
    .WithHttpEndpoint(port: 8200, targetPort: 8201)
    .WithExternalHttpEndpoints();

builder.Build().Run();
