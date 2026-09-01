# Demo sandbox

Open `/demo/` from the site, or choose **Load sample project** on the first desktop-app screen. The browser page has a persistent **Demo — sample data, nothing is saved with your archive** banner with **Reset demo** and **Start for real**.

The sample contains a Markdown migration plan, an HTML field note, and an mbox message. Search `MAPLE-742`, `Northwind`, or `original export` to see a source-grounded match. The browser stores only the current sample query under `demo:local-data-finder:query`; **Start for real** clears it and returns home. The desktop sample uses `demo-index.json` and the `demo-sample` directory below the app data directory; it never reads or writes the normal index. **Reset demo** recreates those records. **Start for real** removes both desktop demo artifacts before the visitor chooses a source.
