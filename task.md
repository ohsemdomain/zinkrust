Price Field Migration from DECIMAL to INTEGER (Cents-based Storage)

CONTEXT
You are tasked with migrating a product price system from storing prices as DECIMAL (dollars) to INTEGER (cents) to eliminate floating-point precision errors in financial calculations. You can just update migration file (change DECIMAL to INTEGER) as I can can clear the table as I mentioned before.

QUALITY ASSURANCE CHECKLIST
Before marking complete, verify:
✅ Database: Migration file uses price_cents INTEGER NOT NULL
✅ Schemas: All validation uses price_cents field name
✅ Backend: All database queries reference price_cents column
✅ Backend: Price removed from allowedColumns for sorting
✅ Backend: All .bind() parameters use price_cents
✅ Utilities: Price conversion functions created and working
✅ Forms: Input accepts dollars, stores as cents
✅ Forms: All form validation uses price_cents
✅ Display: All prices show as formatted currency (e.g., "$12.99")
✅ Display: No price sorting options in UI
✅ Hooks: All mutations use price_cents consistently
✅ Hooks: All optimistic updates use price_cents
✅ Hooks: Price sorting removed from all sortOrders arrays
✅ Types: All TypeScript interfaces use price_cents: number
✅ Routes: All route components use price_cents
TESTING REQUIREMENTS
Test these scenarios:

Create product with price $12.99 → verify database stores 1299
Display product with 1299 cents → verify shows "$12.99"
Edit product → verify form shows correct dollar amount
Sort options → verify no price sorting options appear
Price validation → verify negative/too large prices are rejected
Type safety → verify no TypeScript errors after changes

ERROR PREVENTION NOTES
⚠️ Critical: Never mix dollar and cent values in calculations
⚠️ Critical: Always convert user input (dollars) to cents before storage
⚠️ Critical: Always convert stored values (cents) to dollars for display
⚠️ Critical: Update ALL instances of price to price_cents - missing one will cause runtime errors
⚠️ Critical: Remove ALL price sorting functionality from backend and frontend
⚠️ Critical: Update all TypeScript types and interfaces
⚠️ Critical: Test form submission end-to-end to ensure cents conversion works
COMPLETION CRITERIA

Task is complete when:

All files compile without TypeScript errors
All tests pass (create the test scenarios above)
Price input/output works correctly in UI
Database stores integer cent values
No references to old price field remain in codebase
No price sorting options appear in the UI
Backend rejects price sorting requests
All optimistic updates work correctly with cents
Currency displays correctly formatted across all components