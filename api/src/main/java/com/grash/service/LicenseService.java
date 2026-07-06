package com.grash.service;

import com.grash.dto.license.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LicenseService {

    private static final Set<String> ALL_ENTITLEMENTS = Arrays.stream(LicenseEntitlement.values())
            .map(Enum::toString)
            .collect(Collectors.toSet());

    public LicensingState getLicensingState() {
        return LicensingState.builder()
                .hasLicense(true)
                .valid(true)
                .planName("Self-Hosted")
                .entitlements(ALL_ENTITLEMENTS)
                .usersCount(Integer.MAX_VALUE)
                .build();
    }

    public boolean isSSOEnabled() {
        return false;
    }

    public boolean hasEntitlement(LicenseEntitlement entitlement) {
        return true;
    }
}