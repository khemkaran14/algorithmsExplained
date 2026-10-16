import java.net.URI;
import java.net.http.*;
import java.time.Duration;
class HTTPS {static int fetch(URI uri) throws Exception {if(!"https".equalsIgnoreCase(uri.getScheme()))throw new IllegalArgumentException("HTTPS required");HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();HttpRequest request=HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(20)).GET().build();
// The platform TLS client supplies trust and hostname validation.
return client.send(request,HttpResponse.BodyHandlers.discarding()).statusCode();}}
