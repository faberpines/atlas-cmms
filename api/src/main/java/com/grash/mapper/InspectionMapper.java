package com.grash.mapper;

import com.grash.dto.InspectionShowDTO;
import com.grash.model.Inspection;
import org.mapstruct.Mapper;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring", uses = {FileMapper.class, UserMapper.class, AssetMapper.class, WorkOrderMapper.class})
public interface InspectionMapper {
    @Mappings({})
    InspectionShowDTO toShowDto(Inspection model);
}
