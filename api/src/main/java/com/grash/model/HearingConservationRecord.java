package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class HearingConservationRecord extends CompanyAudit {

    /** WA L&I Section 1 – Program Info */
    private LocalDate programDate;
    private String programAdmin;
    private LocalDate reviewDate;

    /** WA L&I Section 2 – Noise Areas & Measurements (JSON array) */
    @Column(columnDefinition = "TEXT")
    private String noiseAreas;

    /** WA L&I Section 3 – Hearing Protection Devices (JSON array) */
    @Column(columnDefinition = "TEXT")
    private String hpdDevices;

    @Column(columnDefinition = "TEXT")
    private String hpdStorageLocations;

    @Column(columnDefinition = "TEXT")
    private String requiredUseAreas;

    /** WA L&I Section 4 – Audiometric Testing */
    @Column(columnDefinition = "TEXT")
    private String audiometricPositions;

    private String audiometricProvider;

    @Column(columnDefinition = "TEXT")
    private String audiometricSchedule;

    @Column(columnDefinition = "TEXT")
    private String baselineProcedure;

    @Column(columnDefinition = "TEXT")
    private String annualProcedure;

    @Column(columnDefinition = "TEXT")
    private String thresholdShiftProcedure;

    /** WA L&I Section 5 – Training */
    @Column(columnDefinition = "TEXT")
    private String trainingProgram;

    @Column(columnDefinition = "TEXT")
    private String trainingTopics;

    @Column(columnDefinition = "TEXT")
    private String trainingSchedule;

    /** WA L&I Section 6 – Access to Records */
    @Column(columnDefinition = "TEXT")
    private String noiseMeasurementRecordsLocation;

    @Column(columnDefinition = "TEXT")
    private String audiometricRecordsLocation;

    @Column(columnDefinition = "TEXT")
    private String recordsAccessProcedure;

    /** WA L&I Section 7 – Program Evaluation */
    private LocalDate lastEvaluationDate;

    @Column(columnDefinition = "TEXT")
    private String evaluationNotes;

    @Column(columnDefinition = "TEXT")
    private String deficienciesFound;

    @Column(columnDefinition = "TEXT")
    private String correctiveActions;
}
