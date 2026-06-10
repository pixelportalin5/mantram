"use client";

import type { CheckoutAddress } from "@/lib/checkout-types";

type CheckoutAddressFieldsProps = {
  prefix: string;
  value: CheckoutAddress;
  onChange: (address: CheckoutAddress) => void;
};

export default function CheckoutAddressFields({
  prefix,
  value,
  onChange,
}: CheckoutAddressFieldsProps) {
  const set = (field: keyof CheckoutAddress, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-1">
        <span className="label">First Name</span>
        <input
          type="text"
          name={`${prefix}-firstName`}
          autoComplete="given-name"
          required
          value={value.firstName}
          onChange={(e) => set("firstName", e.target.value)}
          className="input"
        />
      </label>
      <label className="block sm:col-span-1">
        <span className="label">Last Name</span>
        <input
          type="text"
          name={`${prefix}-lastName`}
          autoComplete="family-name"
          required
          value={value.lastName}
          onChange={(e) => set("lastName", e.target.value)}
          className="input"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="label">Company (optional)</span>
        <input
          type="text"
          name={`${prefix}-company`}
          autoComplete="organization"
          value={value.company ?? ""}
          onChange={(e) => set("company", e.target.value)}
          className="input"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="label">Address</span>
        <input
          type="text"
          name={`${prefix}-address1`}
          autoComplete="address-line1"
          required
          value={value.address1}
          onChange={(e) => set("address1", e.target.value)}
          className="input"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="label">Apartment, suite, etc. (optional)</span>
        <input
          type="text"
          name={`${prefix}-address2`}
          autoComplete="address-line2"
          value={value.address2 ?? ""}
          onChange={(e) => set("address2", e.target.value)}
          className="input"
        />
      </label>
      <label className="block">
        <span className="label">City</span>
        <input
          type="text"
          name={`${prefix}-city`}
          autoComplete="address-level2"
          required
          value={value.city}
          onChange={(e) => set("city", e.target.value)}
          className="input"
        />
      </label>
      <label className="block">
        <span className="label">State</span>
        <input
          type="text"
          name={`${prefix}-state`}
          autoComplete="address-level1"
          required
          value={value.state}
          onChange={(e) => set("state", e.target.value)}
          className="input"
        />
      </label>
      <label className="block">
        <span className="label">Postcode</span>
        <input
          type="text"
          name={`${prefix}-postcode`}
          autoComplete="postal-code"
          required
          value={value.postcode}
          onChange={(e) => set("postcode", e.target.value)}
          className="input"
        />
      </label>
      <label className="block">
        <span className="label">Country</span>
        <select
          name={`${prefix}-country`}
          autoComplete="country"
          required
          value={value.country}
          onChange={(e) => set("country", e.target.value)}
          className="input"
        >
          <option value="IN">India</option>
          <option value="US">United States</option>
          <option value="GB">United Kingdom</option>
          <option value="AE">United Arab Emirates</option>
          <option value="SG">Singapore</option>
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="label">Phone</span>
        <input
          type="tel"
          name={`${prefix}-phone`}
          autoComplete="tel"
          value={value.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
          className="input"
        />
      </label>
    </div>
  );
}
