package com.grash.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.grash.dto.FileMiniDTO;
import com.grash.dto.FileShowDTO;
import com.grash.factory.StorageServiceFactory;
import com.grash.model.File;
import com.grash.service.StorageService;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;

@Mapper(componentModel = "spring")
public abstract class FileMapper {

    @Lazy
    @Autowired
    private StorageServiceFactory storageServiceFactory;

    @Value("${api.host}")
    private String apiHost;

    @Mappings({})
    public abstract FileMiniDTO toMiniDto(File model);

    public abstract FileShowDTO toShowDto(File model);

    @AfterMapping
    protected FileShowDTO toShowDto(File model, @MappingTarget FileShowDTO target) {
        target.setUrl(getFileViewUrl(model));
        return target;
    }

    @AfterMapping
    protected FileMiniDTO toMiniDto(File model, @MappingTarget FileMiniDTO target) {
        target.setUrl(getFileViewUrl(model));
        return target;
    }

    private String getFileViewUrl(File file) {
        // Serve files through the backend API so they are accessible from any PC
        // that can reach the application, without needing direct MinIO port access.
        return apiHost + "/files/view/" + file.getId();
    }
}
