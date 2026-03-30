#:sdk Aspire.AppHost.Sdk@13.2.0
#:package Aspire.Hosting.JavaScript@13.2.0
#:package Aspire.Hosting.Python@13.2.0

var builder = DistributedApplication.CreateBuilder(args);

// API — Express.js / TypeScript backend
var api = builder.AddJavaScriptApp("api", "./src/api")
    .WithHttpHealthCheck("/health");

// Web — Next.js frontend
builder.AddJavaScriptApp("web", "./src/web")
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WaitFor(api);

// Docs — MkDocs documentation server
builder.AddPythonExecutable("docs", ".", "mkdocs")
    .WithArgs("serve", "--dev-addr", "0.0.0.0:8200")
    .WithExternalHttpEndpoints();

builder.Build().Run();
