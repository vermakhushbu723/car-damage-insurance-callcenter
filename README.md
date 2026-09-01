# IBima Assist – Call Center / Claim Management

React + Vite frontend for the call-center claim screens. UI built with
**Ant Design 6** + **Tailwind CSS 4**.

```bash
npm install
npm run dev      # http://localhost:5190
npm run build
npm run preview
```

## Layout & routing

The blue rail runs the full height on the left and the blue application bar sits
beside it; every page renders inside that shell.
`src/constants/navigation.js` is the single source of truth: the sidebar renders it
and `AppRoutes` generates the routes from it, so the menu and the router can never
fall out of sync.

| Sidebar item                            | Route                                  | Screen                        |
| --------------------------------------- | -------------------------------------- | ----------------------------- |
| Dashboard                               | `/`                                    | Intimation dashboard          |
| My Claims -> All Claims                 | `/claims/all`                          | placeholder (design pending)  |
| My Claims -> New/Assigned               | `/claims/new-assigned`                 | placeholder                   |
| My Claims -> Claim Details              | `/claims/details`                      | Claim details + doc viewer    |
| My Claims -> AI ILA Pending             | `/claims/ai-ila`                       | AI loss assessment            |
| My Claims -> Handler ILA Pending        | `/claims/handler-ila`                  | ILA (liability assessment)    |
| My Claims -> FLA Pending                | `/claims/fla`                          | placeholder                   |
| My Claims -> Payment Recommendation     | `/claims/payment-recommendation`       | Payment recommendation        |
| Claim Processing -> Intimation          | `/claim-processing/intimation`         | Intimation form               |
| Claim Processing -> Handler Allocation  | `/claim-processing/handler-allocation` | Handler allocation            |
| Claim Processing -> Surveyor Assignment | `/claim-processing/surveyor-assignment`| Surveyor assignment           |
| Claim Processing -> Survey Paybill      | `/claim-processing/survey-paybill`     | Survey paybill                |
| Claim Processing -> Issue Letter        | `/claim-processing/issue-letter`       | Issue letter + live preview   |
| Documents DMS                           | `/documents-dms`                       | Document upload / DMS         |
| Communication                           | `/communication`                       | Claim communication log       |
| (claim action bar)                      | `/communication/history`               | Communication history         |
| Workshop                                | `/workshop`                            | placeholder                   |
| Report & Analytics                      | `/reports`                             | placeholder                   |
| My Account                              | `/my-account`                          | placeholder                   |

Unknown paths redirect to `/`. Sections with no design yet render
`PlaceholderPage`, so the menu is fully navigable without inventing a UI.

## Sidebar behaviour

- **Open by default** (208px). The hamburger in the blue bar is the *only* toggle –
  it collapses the rail to 60px icon-only (labels become tooltips) and back. The
  choice is kept in `localStorage` under `sidebar-collapsed`, so it survives a reload.
- The page beside it is a flex sibling, so **content reflows automatically** when the
  sidebar opens or collapses — it never overlaps or drops below the rail.
- A parent route stays highlighted while one of its children is open
  (e.g. `Claims` + `Communication History`).
- Below `lg` the rail becomes a drawer opened from a compact dark header bar.

## Folder structure

```
src/
├── assets/                     static files
├── components/
│   ├── common/                 shared UI (SectionCard, StatCard, TableCard, Pager, Logo, iconRegistry)
│   ├── communication/          both communication designs (tables, stats bar, side panels)
│   ├── dashboard/              dashboard table column definitions
│   ├── intimation/             form section renderer, dynamic field, DMS panel, link section
│   ├── claim/                  ClaimShell (title + meta + stage tracker + action bar), doc viewer
│   ├── ila/                    damage map, AI viewer, insights, detected table, feedback loop
│   ├── letters/                issue-letter form, checklist, live letter preview, dispatch panel
│   └── layout/                 TopBar + Sidebar + AppLayout (the app shell)
├── config/
│   ├── intimationForm.js       the 6 form sections described as data
│   └── dmsDocuments.js         DMS document tiles + upload hint
├── constants/
│   ├── navigation.js           sidebar menu + current user (drives routing too)
│   ├── options.js              select / radio option lists
│   └── routes.js               every path in one place
├── data/                       mock API data (dashboard, communication, claim)
├── hooks/                      useMediaQuery, useLocalStorage
├── pages/                      one folder per screen (+ placeholders/)
├── routes/AppRoutes.jsx        routes generated from the sidebar config
├── theme/antdTheme.js          Ant Design tokens + brand colours
└── utils/cn.js                 class-name joiner
```

## How it stays dynamic

- **Form** – `config/intimationForm.js` describes every section and field
  (`text | select | date | time | textarea | radio | search | spacer`).
  `FormSection` + `DynamicField` render it, so a new field is a config entry,
  never a component change. Form state lives in `IntimationPage`.
- **Tables** – columns are declared in `components/dashboard/dashboardColumns.jsx`
  and fed from `src/data`.
- **Stats** – the communication tiles and tab counts are derived from the log itself
  (`buildCommunicationStats`), so they can never drift from the rows.
- **Navigation + routing** – both come from `constants/navigation.js`.
- **Claim shell** – `ClaimShell` renders the title, claim identity row, meta bar,
  8-stage tracker and the action bar for every claim-processing screen. A page just
  passes its `stage` key and everything up to it is marked done.
- **AI Loss Assessment** – every cell of the detected-damage table is editable; the
  totals, repair/replace split, correction count and the CSM Review pipeline step are
  all recomputed from those edits. The 360° map, overlays and gauges are drawn from
  `data/ilaData.js`.
- **Issue Letter** – the requested-documents checklist swaps with the letter type
  (`REQUIREMENTS_BY_LETTER_TYPE`), agents can append their own requirement, and the
  letter preview is rebuilt from the form on every keystroke, so the preview and the
  letter that gets issued can never disagree. Moving the issue date shifts the
  response deadline by the same window.
- **Two communication designs, one dataset** – `Letters → Communication History` and
  `Communication` render the same `data/communicationData.js` log with different
  components, so the numbers stay in step across both screens.

## Type scale

Buttons, inputs, selects and pickers all use the default (32px) Ant Design size –
`size="large"` is deliberately not used anywhere. Base font size is 12.5px (`body` in `index.css`, mirrored by the Ant Design
`fontSize` token) so a full claim screen fits a laptop viewport without zooming.
The scale runs 9px (captions) -> 11–12.5px (body and table cells) -> 14.5px (card
headings) -> 20px (page titles). Controls use `controlHeight: 32` and tables
`cellPaddingBlock: 9`. Change those two tokens plus the `body` rule to re-scale
the whole app.

## Responsive behaviour

- Sidebar becomes a drawer below `lg`.
- Intimation: 2-column field grid stacks to 1 column below `md`;
  the DMS rail moves under the form below `xl`.
- Tables scroll horizontally on small screens; the pager wraps.

## Wiring a backend

Replace the modules in `src/data/` with API calls and keep the same shape.
Nothing in `components/` reads from the network.
