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
    private Object timestampRaw; // Unix timestamp - may arrive as long or String from API

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
        this.timestampRaw = timestamp;
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
        if (timestampRaw instanceof Number) {
            return ((Number) timestampRaw).longValue();
        } else if (timestampRaw instanceof String) {
            try {
                return Long.parseLong((String) timestampRaw);
            } catch (NumberFormatException e) {
                try {
                    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat(
                            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US);
                    sdf.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                    java.util.Date date = sdf.parse((String) timestampRaw);
                    return date != null ? date.getTime() : 0;
                } catch (Exception ex) {
                    return 0;
                }
            }
        }
        return 0;
    }

    public void setTimestamp(long timestamp) {
        this.timestampRaw = timestamp;
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
                ", timestamp=" + getTimestamp() +
                ", contactName='" + contactName + '\'' +
                ", callStatus='" + callStatus + '\'' +
                '}';
    }
}