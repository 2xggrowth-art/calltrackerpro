package com.calltrackerpro.calltracker.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class CallLog implements Serializable {
    private static final long serialVersionUID = 1L;

    @SerializedName(value = "id", alternate = {"_id"})
    private String id;

    @SerializedName(value = "phone_number", alternate = {"phoneNumber"})
    private String phoneNumber;

    @SerializedName(value = "call_type", alternate = {"callType"})
    private String callType; // incoming, outgoing, missed

    @SerializedName("duration")
    private long duration; // in seconds

    @SerializedName("timestamp")
    private long timestamp; // Unix timestamp

    @SerializedName(value = "contact_name", alternate = {"contactName"})
    private String contactName;

    @SerializedName(value = "call_status", alternate = {"callStatus", "status"})
    private String callStatus; // completed, missed, declined

    @SerializedName(value = "date", alternate = {"callDate"})
    private String date;

    @SerializedName("time")
    private String time;

    @SerializedName(value = "user_id", alternate = {"userId"})
    private String userId;

    @SerializedName(value = "created_at", alternate = {"createdAt"})
    private String createdAt;

    @SerializedName(value = "updated_at", alternate = {"updatedAt"})
    private String updatedAt;

    // Constructors
    public CallLog() {}

    public CallLog(String phoneNumber, String callType, long duration, long timestamp) {
        this.phoneNumber = phoneNumber;
        this.callType = callType;
        this.duration = duration;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCallType() {
        return callType;
    }

    public void setCallType(String callType) {
        this.callType = callType;
    }

    public long getDuration() {
        return duration;
    }

    public void setDuration(long duration) {
        this.duration = duration;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getCallStatus() {
        return callStatus;
    }

    public void setCallStatus(String callStatus) {
        this.callStatus = callStatus;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Utility methods
    public String getFormattedDuration() {
        long minutes = duration / 60;
        long seconds = duration % 60;
        return String.format("%02d:%02d", minutes, seconds);
    }

    public String getDisplayName() {
        return contactName != null && !contactName.isEmpty() ? contactName : phoneNumber;
    }

    @Override
    public String toString() {
        return "CallLog{" +
                "id='" + id + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", callType='" + callType + '\'' +
                ", duration=" + duration +
                ", timestamp=" + timestamp +
                ", contactName='" + contactName + '\'' +
                ", callStatus='" + callStatus + '\'' +
                '}';
    }
}