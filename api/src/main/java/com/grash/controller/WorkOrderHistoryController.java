package com.grash.controller;

import com.grash.dto.WorkOrderHistoryShowDTO;
import com.grash.dto.WorkOrderHistoryPostDTO;
import com.grash.exception.CustomException;
import com.grash.mapper.WorkOrderHistoryMapper;
import com.grash.model.OwnUser;
import com.grash.model.WorkOrder;
import com.grash.model.WorkOrderHistory;
import com.grash.service.UserService;
import com.grash.service.WorkOrderHistoryService;
import com.grash.service.WorkOrderService;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/work-order-histories")
@Tag(name = "workOrderHistory")
@RequiredArgsConstructor
public class WorkOrderHistoryController {

    private final WorkOrderHistoryService workOrderHistoryService;
    private final UserService userService;
    private final WorkOrderService workOrderService;
    private final WorkOrderHistoryMapper workOrderHistoryMapper;

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public WorkOrderHistoryShowDTO getById(@PathVariable("id") Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        Optional<WorkOrderHistory> optionalWorkOrderHistory = workOrderHistoryService.findById(id);
        if (optionalWorkOrderHistory.isPresent()) {
            WorkOrderHistory savedWorkOrderHistory = optionalWorkOrderHistory.get();
            return workOrderHistoryMapper.toShowDto(savedWorkOrderHistory);
        } else throw new CustomException("Not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/work-order/{id}")
    @PreAuthorize("permitAll()")

    public Collection<WorkOrderHistoryShowDTO> getByWorkOrder(@PathVariable("id") Long id,
                                                              HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        Optional<WorkOrder> optionalWorkOrder = workOrderService.findById(id);
        if (optionalWorkOrder.isPresent()) {
            return workOrderHistoryService.findByWorkOrder(id).stream().map(workOrderHistoryMapper::toShowDto).collect(Collectors.toList());
        } else throw new CustomException("Not found", HttpStatus.NOT_FOUND);
    }

    @PostMapping("/work-order/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public WorkOrderHistoryShowDTO create(@PathVariable("id") Long id,
                                          @Valid @RequestBody WorkOrderHistoryPostDTO historyRequest,
                                          HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        WorkOrder workOrder = workOrderService.findById(id)
                .orElseThrow(() -> new CustomException("Work Order not found", HttpStatus.NOT_FOUND));

        if (!workOrder.canBeEditedBy(user)) {
            throw new CustomException("Forbidden", HttpStatus.FORBIDDEN);
        }

        WorkOrderHistory history = WorkOrderHistory.builder()
                .name(historyRequest.getName().trim())
                .user(user)
                .workOrder(workOrder)
                .build();
        return workOrderHistoryMapper.toShowDto(workOrderHistoryService.create(history));
    }

}

