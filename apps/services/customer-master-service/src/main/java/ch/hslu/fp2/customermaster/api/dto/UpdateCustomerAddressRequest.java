package ch.hslu.fp2.customermaster.api.dto;

public record UpdateCustomerAddressRequest(
        String fullAddressRaw,
        String street,
        String buildingNo,
        String postalCode,
        String city,
        String deliveryAddressNote,
        String tourType,
        String timeWindowStart,
        String timeWindowEnd,
        Integer serviceTimeMinutes,
        Boolean monday,
        Boolean tuesday,
        Boolean wednesday,
        Boolean thursday,
        Boolean friday,
        Boolean saturday,
        Integer mondayDeliveryDemandUnits,
        Integer mondayPickupDemandUnits,
        Integer tuesdayDeliveryDemandUnits,
        Integer tuesdayPickupDemandUnits,
        Integer wednesdayDeliveryDemandUnits,
        Integer wednesdayPickupDemandUnits,
        Integer thursdayDeliveryDemandUnits,
        Integer thursdayPickupDemandUnits,
        Integer fridayDeliveryDemandUnits,
        Integer fridayPickupDemandUnits,
        Integer saturdayDeliveryDemandUnits,
        Integer saturdayPickupDemandUnits,
        String deliveryNotes
) {
}
