package com.example.keycloak.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

public class FileTypeValidator {

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
            "application/vnd.oasis.opendocument.spreadsheet",
            "text/xml"
    );

    public static void validateExcelOrSvgFile(MultipartFile file) {
        if (!ALLOWED_MIME_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type. Only Excel, CSV, ODS, XML, or SVG files are allowed.");
        }
    }
}
