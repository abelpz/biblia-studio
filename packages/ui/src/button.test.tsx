import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button appName="Test">Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeTruthy();
  });
});
