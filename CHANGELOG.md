# Calcuoke Changelog

All notable changes to the Calcuoke system will be documented in this file.

## [4.0.0] - 2026-08-11

### Added

- **Responsive Navigation**: Added a dedicated mobile header and bottom navigation while retaining the full desktop sidebar experience.
- **Business Summary Dashboard**: Added at-a-glance totals for sales records, recorded value, inventory assets, and hardware swaps.
- **Accessible Theme Controls**: Added light and dark theme switching across desktop and mobile navigation.
- **Searchable Replacement Audit Trail**: Added a streamlined replacements view with search, category filtering, and clear empty states.

### Changed

- **Complete Interface Overhaul**: Redesigned the dashboard, assembly workspace, component inventory, replacements ledger, notifications, and shared navigation with a cohesive responsive visual system.
- **Improved Responsive Workflows**: Refined sale registration, component selection, hardware swap, confirmation, and warranty dialogs for desktop and mobile screens.
- **Dashboard Record Experience**: Improved project search, customer record presentation, action layouts, and access to warranty and replacement workflows.
- **Warranty Presentation**: Refined certificate viewing and PDF download controls while preserving the originally purchased bill of materials after hardware swaps.

## [3.6.0] - 2025-01-24

### Added

- **Contextual Component Creation**: "Assemble" screen now detects empty categories and provides "Create New" deep-links.
- **Smart Deep-linking**: Navigating to Components from Assemble now auto-opens the "Add New" modal with the relevant Category pre-selected.
- **PLATINUM Brand Automation**: Component registry now auto-fills "PLATINUM" brand for any Player category selection.
- **Workflow Redirects**: Discarding a component creation now intelligently redirects back to the Assemble screen if the flow started there.
- **Replacements Ledger Filters**: Added Category filters (Mic, Player, Amp, TV) to the Replacements view.
- **Warranty Certificate Integrity**: Modified the warranty document generation to only list the original hardware components purchased at the time of sale. Subsequent hardware swaps are now correctly excluded from the official warranty certificate to maintain original sales integrity.

## [3.5.0] - 2025-01-23

### Added

- **Hardware Traceability**: Integrated "Swap History" into the Project Manage modal for full asset lifecycle tracking.
- **Transaction Photo Support**: Added multi-photo upload capabilities for sales records with lightbox preview.
- **Enhanced Search**: Implemented fuzzy search for projects by Invoice Number, Grade, or Buyer Name.
- **UI Modernization**: Realigned Replacements ledger to match the Vault's layout for consistent UX.

## [3.0.0] - 2025-12-20

### Added

- **Major Infrastructure Upgrade**: Migrated to React 19 and Vite 6.
- **Advanced State Management**: Refined sync logic between Online DB and Local Simulation modes.
- **TypeScript 5.7**: Strict type-checking across all data models.

## [2.5.0] - 2025-11-15

### Added

- **PDF Warranty Engine**: Integration with `html2pdf.js` for professional-grade warranty certificate generation.
- **Categorized Warranty Terms**: Logic for category-specific warranty windows (7-day replacement for electronics, no warranty for chassis).
- **Replacements Ledger**: Initial release of the centralized swap tracking screen.

## [2.2.0] - 2025-10-05

### Added

- **Hardware Swap Engine**: Introduced "Same Model" vs "Alternative" swap logic with inventory deduction.
- **7-Day Warranty Guard**: Automated calculation of warranty windows based on sale date.
- **SKU Duplicate Prevention**: System-wide check for serial number uniqueness in the registry.

## [1.9.0] - 2025-09-01

### Added

- **Assembly 2.0**: Complete overhaul of the set builder with real-time budget calculation.
- **Project Grade Calculation**: Automatic assignment of "Premium" vs "Standard" grades based on machine cost.
- **Buyer Metadata**: Expanded sales registration to include Address, Receipt Types (ORD, DLV, SALES), and Date Sold.

## [1.6.0] - 2025-07-20

### Added

- **The Component Vault**: Full CRUD operations for hardware assets.
- **Image Compression**: Client-side JPEG compression for high-quality reference images in LocalStorage.
- **Catalog Sorting**: Multi-column sorting for the components ledger.

## [1.3.0] - 2025-05-10

### Added

- **Tokyo Night Theme**: Implementation of the dark/neon aesthetic and Space Grotesk typography.
- **Responsive Dashboard**: Mobile-ready layout for on-the-go inventory checks.
- **Local Storage Persistance**: Initial implementation of "Simulation Mode" for offline use.

## [1.0.0] - 2025-03-01

### Added

- **Core System Framework**: Initial project structure with Types, Seed Data, and Navigation.
- **Basic Dashboard**: Listing and viewing of simple project records.
- **Material Symbols Integration**: Consistent iconography system.
