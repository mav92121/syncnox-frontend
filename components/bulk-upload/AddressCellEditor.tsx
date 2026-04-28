"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { ICellEditorParams } from "ag-grid-community";
import AddressAutocomplete, { AddressData } from "@/components/AddressAutocomplete";
import { useBulkUploadStore } from "@/store/bulkUpload.store";

export default forwardRef((props: ICellEditorParams, ref) => {
  const [currentValue, setCurrentValue] = useState(props.value);

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return currentValue;
      },
    };
  });

  const handleChange = (newValue: string) => {
    setCurrentValue(newValue);
  };

  const handleSelect = (addressData: AddressData) => {
    setCurrentValue(addressData.address_formatted);
    
    const store = useBulkUploadStore.getState();
    const rowIndex = props.node.data.id;
    const currentRow = store.geocodedData[rowIndex];

    if (currentRow) {
      store.updateGeocodedRow(rowIndex, {
        geocode_result: {
          ...currentRow.geocode_result,
          lat: addressData.location.lat,
          lng: addressData.location.lng,
          address: addressData.address_formatted,
          formatted_address: addressData.address_formatted,
          error: null,
        },
        is_duplicate: false,
      });
    }

    // Stop editing since we've made a selection
    setTimeout(() => props.stopEditing(), 0);
  };

  return (
    <div
      style={{
        width: "350px",
        background: "#fff",
        padding: "8px",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <AddressAutocomplete
        value={props.value}
        onChange={handleChange}
        onSelect={handleSelect}
        placeholder="Search for an address"
      />
    </div>
  );
});
