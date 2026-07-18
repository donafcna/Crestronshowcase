# Custom rules for FutureAV Crestron Project

## Crestron CH5 & C# Pro Rules
- **Rule of Gold**: Avoid relying on custom JavaScript DOM manipulation or raw WebXpanel subscriptions for visual states (like buttons active colors or displaying numeric values) on the physical TS1070.
- **Native CH5 Elements**: Always use native CH5 attributes such as `receiveStateSelected`, `sendEventOnClick`, and `data-ch5-textcontent` for syncing states with the C# Pro processor.
- **Digital Joins for Feedback**: Use Digital (Boolean) Joins for button active/selection feedback. Do not use Analog Joins or manual CSS class toggles (`is-active`).
- **String Joins for Numeric Display**: Convert numeric formats (like target temperatures or current values) to formatted strings on the C# backend, and display them using `data-ch5-textcontent` to avoid async loading/timing issues with Javascript.

## Milestone Backups
- **Version v1.0.58 Milestone**: This is the reference stable release. It features fully decoupled Room/Source selectors, native Crestron Joins for temperature display, legacy-compatible `XMLHttpRequest` live weather (Nyon), and SSL-proxied Le Monde RSS feeds.
- **Backup Location**: A full copy of the source code (`src/`) and compiled archive (`dist/`) is archived at [milestone_v1.0.58](file:///C:/Users/donat/Desktop/FutureAV/__Archives/milestone_v1.0.58/).
- **Restoration Procedure**: To revert to this milestone autonomously:
  1. Delete everything in `C:\Users\donat\Desktop\FutureAV\src\` and `C:\Users\donat\Desktop\FutureAV\dist\`.
  2. Copy the contents of `C:\Users\donat\Desktop\FutureAV\__Archives\milestone_v1.0.58\src\` to `src/`.
  3. Copy the contents of `C:\Users\donat\Desktop\FutureAV\__Archives\milestone_v1.0.58\dist\` to `dist/`.
  4. Run compilation: `npx ch5-cli archive -p villa-frequencetv -d src -o dist`.
