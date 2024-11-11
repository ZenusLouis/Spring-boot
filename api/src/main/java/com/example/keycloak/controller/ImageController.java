    package com.example.keycloak.controller;

    import org.springframework.web.bind.annotation.*;
    import org.springframework.core.io.Resource;
    import org.springframework.core.io.UrlResource;
    import org.springframework.http.HttpHeaders;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.net.MalformedURLException;
    import java.nio.file.Path;
    import java.nio.file.Paths;
    import java.nio.file.StandardCopyOption;

    @RestController
    @RequestMapping("/api/images")
    public class ImageController {

        private final String UPLOAD_DIR = "uploads/products";

        @GetMapping("/{filename}")
        public ResponseEntity<Resource> getImage(@PathVariable String filename) {
            try {
                Path path = Paths.get(UPLOAD_DIR).resolve(filename);
                Resource resource = new UrlResource(path.toUri());

                if (resource.exists() || resource.isReadable()) {
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                            .body(resource);
                } else {
                    return ResponseEntity.notFound().build();
                }
            } catch (MalformedURLException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        //Api check file is exist or not
        @GetMapping("/exist/{filename}")
        public ResponseEntity<Boolean> checkImageExists(@PathVariable String filename) throws MalformedURLException {
            Path path = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(path.toUri());
            boolean exists = resource.exists() && resource.isReadable();
            return ResponseEntity.ok(exists);
        }

    }