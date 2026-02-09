using System.Security.Cryptography.X509Certificates;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();
app.UseCors();

// Capturar huella

app.MapPost("/api/capture", () =>
{
   var template = GenerateTemplate();
   var quality = new Random().Next(85, 100);

   Console.WriteLine($"Huella capturada: {template.Substring(0, 15)}...");

   return Results.Ok(new
   {
       success = true,
       template,
       quality,
       timestamp = DateTime.Now
   });
});

// Mutar Template

app.MapPost("/api/mutate", (MutateRequest req) =>
{
    var mutted = MulticastDelegate(req.Template);

    return Results.Ok(new
    {
       success = true,
       mutatedFull = mutated 
    });
});

// Health
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

Console.WriteLine("C# iniciado en http://localhost:5000");
app.Run("http://localhost:5000");

// Auxiliares
string GenerateTemplate()
{
    const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var random = new Random();
    var template = new char[64];
    for (int i = 0; i < 64; i++)
        template[i] = chars[random.Next(chars.Length)];
    return new string(template);
}

string Mutate(string original)
{
    const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var random = new Random();
    var mutated = original.ToCharArray();
    for (int i = 0; i < 3; i++)
    {
        int pos = random.Next(mutated.Length);
        mutated[pos] = chars[random.Next(chars.Length)];
    }
    return new string(mutated);
}

record MutateRequest(string Template);
