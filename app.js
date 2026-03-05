const seedCampaigns = [
  ["spring_new_user_push_offer", "Push", "ava.brown@demoecommerce.com", "Mar 4, 5:36 PM", "2.11%", "Scheduled"],
  ["email_category_drop_alert", "Email", "liam.jones@demoecommerce.com", "Mar 4, 4:30 PM", "6.22%", "Draft"],
  ["cart_recovery_reminder_wave2", "Push", "mia.smith@demoecommerce.com", "Mar 4, 1:50 PM", "1.89%", "Scheduled"],
  ["web_flash_sale_banner", "Browser", "noah.wilson@demoecommerce.com", "Mar 4, 10:59 AM", "0.71%", "Draft"],
  ["weekend_vip_coupon_email", "Email", "emma.taylor@demoecommerce.com", "Mar 4, 10:39 AM", "8.3%", "Scheduled"],
  ["whatsapp_order_followup", "WhatsApp", "olivia.thomas@demoecommerce.com", "Mar 3, 11:25 AM", "39.16%", "Scheduled"],
];

const rows = document.getElementById("campaignRows");
const listView = document.getElementById("listView");
const calendarView = document.getElementById("calendarView");
const modalBackdrop = document.getElementById("modalBackdrop");
const chatLog = document.getElementById("chatLog");
const chatInput = document.getElementById("chatInput");
const detailsPanel = document.getElementById("detailsPanel");
const detailsContent = document.getElementById("detailsContent");
const toast = document.getElementById("toast");
const modalTitle = document.getElementById("modalTitle");
const createMenu = document.getElementById("createMenu");
const setupScreen = document.getElementById("setupScreen");
const workspaceScreen = document.getElementById("workspaceScreen");
const modalBody = document.querySelector(".modal-body");
const chatPanel = document.getElementById("chatPanel");
const calendarPanel = document.getElementById("calendarPanel");
const monthPicker = document.getElementById("monthPicker");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const todayBtn = document.getElementById("todayBtn");
const newThreadBtn = document.getElementById("newThreadBtn");
const toggleThreadsBtn = document.getElementById("toggleThreadsBtn");
const threadsPanel = document.getElementById("threadsPanel");
const threadTitle = document.getElementById("threadTitle");
const newChatBtn = document.getElementById("newChatBtn");
const layoutButtons = Array.from(document.querySelectorAll(".layout-btn"));

let generatedCampaigns = [];
let currentMode = "month";
let calendarLayout = "calendar";
let generationCycle = 0;
let draftedFromDelta = [];
let pendingPlaybook = null;
let csvWorkflowActive = false;
let csvPreviewRows = [];
let lastArtifactType = "";
const todayDate = new Date();
let calendarCursor = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
const baseCalendarEvents = defaultOverlayEvents().map((e) => ({ ...e, source: "prescheduled" }));
let threads = [];
let activeThreadId = null;
let threadSeq = 1;

const emptyChatTemplate =
  '<div id="askAiEmpty" class="askai-empty"><div class="star">✦</div><h4>Start a campaign conversation</h4><p>Type a prompt or attach CSV to begin.</p></div>';

const playbookCatalog = {
  "vip-reactivation": {
    name: "Reactivate dormant VIPs",
    summary: "Win-back strategy for high-value users showing inactivity for 30+ days.",
    details: "Target 3.2K premium users with a 3-touch campaign across Email, Push, and WhatsApp.",
    opportunity: "$427K",
    predictedDollars: "$182K",
    estimatedCost: "$6.8K",
    timeWindow: "14 days",
    dnd: "10:00 PM - 8:00 AM local timezone",
    fcaps: "Max 2 msgs/day, 5 msgs/week",
    segments: ["Premium buyers", "Loyalty members", "High LTV dormant"],
    timeline: [
      { day: "Day 1", channel: "Email", time: "2:15 PM", title: "VIP Welcome Back", content: "We've missed you, {first_name}. Your exclusive offer is inside." },
      { day: "Day 4", channel: "Push", time: "6:30 PM", title: "Curated Recommendations", content: "Top picks are waiting in your VIP feed." },
      { day: "Day 7", channel: "WhatsApp", time: "10:00 AM", title: "Final Reminder", content: "Your early-access offer expires tonight." },
    ],
  },
  "browse-abandoners": {
    name: "Convert high-intent browse abandoners",
    summary: "Recover users who browse repeatedly but do not add to cart.",
    details: "Target 7.8K users with behavioral nudges, social proof, and urgency messaging.",
    opportunity: "$284K",
    predictedDollars: "$119K",
    estimatedCost: "$5.1K",
    timeWindow: "10 days",
    dnd: "11:00 PM - 8:00 AM local timezone",
    fcaps: "Max 2 msgs/day, 4 msgs/week",
    segments: ["Evening browsers", "Cross-device users", "Wishlist creators"],
    timeline: [
      { day: "Day 1", channel: "Email", time: "3:00 PM", title: "Most Viewed Picks", content: "Items you explored are now available with best-seller badges." },
      { day: "Day 3", channel: "Push", time: "7:00 PM", title: "Price Alert", content: "Price check complete, your saved products are trending." },
      { day: "Day 6", channel: "WhatsApp", time: "2:00 PM", title: "Final Day Reminder", content: "Your shortlist is still here. Complete your checkout now." },
    ],
  },
  "first-time-activation": {
    name: "Welcome first-time users",
    summary: "Activation playbook to help new users discover value quickly.",
    details: "Target 4.9K new users with onboarding nudges, product education, and first conversion hooks.",
    opportunity: "$196K",
    predictedDollars: "$82K",
    estimatedCost: "$4.1K",
    timeWindow: "7 days",
    dnd: "10:30 PM - 8:00 AM local timezone",
    fcaps: "Max 2 msgs/day, 6 msgs/week",
    segments: ["New installers", "First session users", "No purchase in 3 days"],
    timeline: [
      { day: "Day 1", channel: "Email", time: "11:00 AM", title: "Welcome + Setup Guide", content: "Get started in 3 steps and unlock your first reward." },
      { day: "Day 3", channel: "Push", time: "5:00 PM", title: "Feature Discovery", content: "Try your next best feature based on your browsing." },
      { day: "Day 6", channel: "In-App", time: "4:00 PM", title: "First Conversion Nudge", content: "Complete your first action and earn bonus points." },
    ],
  },
  "app-engagement": {
    name: "Drive app engagement",
    summary: "Engagement playbook for active users showing drop in session quality.",
    details: "Target 11.2K users with contextual reminders and usage milestones.",
    opportunity: "$238K",
    predictedDollars: "$96K",
    estimatedCost: "$5.4K",
    timeWindow: "21 days",
    dnd: "11:00 PM - 8:00 AM local timezone",
    fcaps: "Max 1 msg/day, 4 msgs/week",
    segments: ["Power users", "Feature adopters", "Drop-off cohort"],
    timeline: [
      { day: "Day 1", channel: "Push", time: "6:00 PM", title: "Weekly Highlights", content: "See what’s new and trending in your account." },
      { day: "Day 8", channel: "Email", time: "1:30 PM", title: "Personalized Picks", content: "Handpicked updates based on your past activity." },
      { day: "Day 15", channel: "In-App", time: "7:00 PM", title: "Milestone Nudge", content: "You’re close to your next milestone reward." },
    ],
  },
  "inactive-winback": {
    name: "Re-engage inactive users",
    summary: "Win-back playbook for users inactive for 30+ days.",
    details: "Target 9.4K users with recovery incentives and urgency sequencing.",
    opportunity: "$311K",
    predictedDollars: "$127K",
    estimatedCost: "$6.0K",
    timeWindow: "14 days",
    dnd: "10:00 PM - 8:00 AM local timezone",
    fcaps: "Max 1 msg/day, 3 msgs/week",
    segments: ["Inactive 30d", "Churn risk high", "No app open 14d"],
    timeline: [
      { day: "Day 1", channel: "Email", time: "10:00 AM", title: "We Miss You Offer", content: "Welcome back with a personalized comeback reward." },
      { day: "Day 5", channel: "Push", time: "6:45 PM", title: "Price Drop Alert", content: "Your saved items are now at better prices." },
      { day: "Day 10", channel: "WhatsApp", time: "11:30 AM", title: "Final Win-back", content: "Last chance to claim your reactivation benefit." },
    ],
  },
};

function renderCampaignRows() {
  rows.innerHTML = "";
  const merged = [
    ...seedCampaigns.map((c) => ({ name: c[0], channel: c[1], createdBy: c[2], createdOn: c[3], rate: c[4], status: c[5] })),
    ...draftedFromDelta,
  ];
  merged.forEach((c, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name}<div class="subtxt">ID: 1774${220000 + i * 431}</div></td>
      <td>${c.channel}</td>
      <td>${c.createdBy || "agent@demoecommerce.com"}</td>
      <td><span class="badge">${String(c.status || "Draft").toUpperCase()}</span></td>
      <td>${c.createdOn || "Mar 6, 10:30 AM"}</td>
      <td>${c.createdOn || "Mar 6, 10:30 AM"}</td>
      <td>${Math.round(Math.random() * 12000)} / ${Math.round(Math.random() * 980000)}<div class="subtxt">Clicked / Sent</div></td>
      <td>${c.rate || "0.00%"}</td>`;
    rows.appendChild(tr);
  });
}
renderCampaignRows();

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function monthKey(dateObj) {
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeEventDate(event) {
  if (event.date instanceof Date) return event.date;
  if (typeof event.date === "string") return new Date(event.date);
  return new Date(todayDate);
}

function updateMonthPicker() {
  monthPicker.value = monthKey(calendarCursor);
}

function alignCalendarToCampaigns(campaigns) {
  if (!campaigns || !campaigns.length) return;
  const first = normalizeEventDate(campaigns[0]);
  calendarCursor = new Date(first.getFullYear(), first.getMonth(), 1);
  updateMonthPicker();
}

function createThread(title) {
  const id = `t_${Date.now()}_${threadSeq++}`;
  threads.push({ id, title, html: "", campaigns: [] });
  return id;
}

function currentThread() {
  return threads.find((t) => t.id === activeThreadId);
}

function snapshotThread() {
  const t = currentThread();
  if (!t) return;
  t.html = chatLog.innerHTML;
  t.campaigns = JSON.parse(JSON.stringify(generatedCampaigns));
}

function restoreThread(id) {
  const t = threads.find((x) => x.id === id);
  if (!t) return;
  activeThreadId = id;
  threadTitle.textContent = t.title;
  chatLog.innerHTML = t.html || emptyChatTemplate;
  generatedCampaigns = JSON.parse(JSON.stringify(t.campaigns || []));
  renderModalCalendar();
  renderPageCalendar();
  renderThreadsPanel();
}

function resetActiveThreadConversation() {
  const t = currentThread();
  if (!t) return;
  generatedCampaigns = [];
  generationCycle = 0;
  csvWorkflowActive = false;
  csvPreviewRows = [];
  lastArtifactType = "";
  calendarLayout = "calendar";
  layoutButtons.forEach((b) => b.classList.toggle("active", b.dataset.layout === "calendar"));
  chatLog.innerHTML = emptyChatTemplate;
  threadTitle.textContent = "New campaign";
  t.title = "New campaign";
  t.html = chatLog.innerHTML;
  t.campaigns = [];
  detailsContent.innerHTML = '<div class="details-empty"><strong>No campaign selected</strong><p>Select a playbook or campaign event to view report, content, segment and execution context.</p></div>';
  renderModalCalendar();
  renderPageCalendar();
  renderThreadsPanel();
}

function renderThreadsPanel() {
  threadsPanel.innerHTML = "";
  threads.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = `thread-item ${t.id === activeThreadId ? "active" : ""}`;
    btn.textContent = t.title;
    btn.onclick = () => restoreThread(t.id);
    threadsPanel.appendChild(btn);
  });
}

function defaultOverlayEvents() {
  return [
    { name: "new_user_welcome_push", date: addDays(todayDate, -14), slot: "10:00", status: "Scheduled", channel: "Push", audience: "New Users", goal: "Activation" },
    { name: "cart_recovery_email_d1", date: addDays(todayDate, -4), slot: "13:00", status: "Draft", channel: "Email", audience: "Cart Abandoners", goal: "Conversion" },
    { name: "weekend_deal_whatsapp", date: addDays(todayDate, 8), slot: "16:00", status: "Scheduled", channel: "WhatsApp", audience: "Deal Seekers", goal: "Revenue" },
    { name: "vip_web_nudge", date: addDays(todayDate, 28), slot: "11:00", status: "Draft", channel: "Browser", audience: "VIP", goal: "CTR" },
    { name: "repeat_purchase_email", date: addDays(todayDate, 52), slot: "09:30", status: "Scheduled", channel: "Email", audience: "Repeat Buyers", goal: "Retention" },
  ];
}

function renderPageCalendar() {
  const events = generatedCampaigns.length ? [...baseCalendarEvents, ...generatedCampaigns] : defaultOverlayEvents();
  calendarView.innerHTML = `<div class="legend"><span class="pre-l">Pre-scheduled</span><span class="delta-l">New AI Campaigns</span><span class="scheduled-l">Scheduled</span><span class="draft-l">Draft</span></div>`;
  const box = document.createElement("div");
  box.className = "calendar-widget";
  calendarView.appendChild(box);
  renderCalendar(box, events, "month");
}

renderPageCalendar();

function renderCalendar(container, events, mode) {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const inView = events.filter((e) => {
    const d = normalizeEventDate(e);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  if (!inView.length) {
    container.innerHTML = '<div class="calendar-empty"><div><strong>No campaigns in this month.</strong><br/>Pick another month or create a new campaign plan.</div></div>';
    return;
  }

  if (mode === "day") {
    const day = todayDate.getDate();
    container.innerHTML = `<div class="month-grid"><div class="cal-cell" style="grid-column: span 7;"><div class="cal-date">${calendarCursor.toLocaleDateString(undefined, { month: "short" })} ${day}</div>${inView
      .filter((e) => normalizeEventDate(e).getDate() === day)
      .map((e) => `<div class="cal-event ${e.status.toLowerCase()} ${e.source || ""}" data-name="${e.name}">${e.source === "prescheduled" ? "[Pre]" : "[+Δ]"} ${e.slot} ${e.name}</div>`)
      .join("")}</div></div>`;
  } else if (mode === "week") {
    container.innerHTML = `<div class="calendar-header-row"><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div></div>`;
    const week = document.createElement("div");
    week.className = "month-grid";
    for (let i = 1; i <= 7; i += 1) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      cell.innerHTML = `<div class="cal-date">${i}</div>`;
      inView.filter((e) => {
        const d = normalizeEventDate(e).getDate();
        return ((d - 1) % 7) + 1 === i;
      }).forEach((e) => {
        const node = document.createElement("div");
        node.className = `cal-event ${e.status.toLowerCase()} ${e.source || ""}`;
        node.dataset.name = e.name;
        node.textContent = `${e.source === "prescheduled" ? "[Pre]" : "[+Δ]"} ${e.slot} ${e.name}`;
        cell.appendChild(node);
      });
      week.appendChild(cell);
    }
    container.appendChild(week);
  } else {
    container.innerHTML = `<div class="calendar-header-row"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div>`;
    const grid = document.createElement("div");
    grid.className = "month-grid";
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      cell.innerHTML = `<div class="cal-date">${day}</div>`;
      inView.filter((e) => normalizeEventDate(e).getDate() === day).forEach((e) => {
        const ev = document.createElement("div");
        ev.className = `cal-event ${e.status.toLowerCase()} ${e.source || ""}`;
        ev.dataset.name = e.name;
        ev.textContent = `${e.source === "prescheduled" ? "[Pre]" : "[+Δ]"} ${e.slot} ${e.name}`;
        cell.appendChild(ev);
      });
      grid.appendChild(cell);
    }
    container.appendChild(grid);
  }

  container.querySelectorAll(".cal-event").forEach((node) => {
    node.onclick = () => {
      const all = generatedCampaigns.length ? [...baseCalendarEvents, ...generatedCampaigns] : defaultOverlayEvents();
      const event = all.find((e) => e.name === node.dataset.name);
      if (event) {
        showDetails(event);
        focusCalendarAndDetails();
      }
    };
  });
}

document.querySelectorAll(".toggle-btn").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const isList = btn.dataset.view === "list";
    listView.classList.toggle("hidden", !isList);
    calendarView.classList.toggle("hidden", isList);
    if (!isList) renderPageCalendar();
  };
});

function openAskAiModal() {
  setupScreen.classList.add("hidden");
  workspaceScreen.classList.remove("hidden");
  modalTitle.textContent = "Campaign Agent";
  generatedCampaigns = [];
  generationCycle = 0;
  csvWorkflowActive = false;
  csvPreviewRows = [];
  lastArtifactType = "";
  calendarLayout = "calendar";
  layoutButtons.forEach((b) => b.classList.toggle("active", b.dataset.layout === "calendar"));
  const empty = document.getElementById("askAiEmpty");
  if (empty) empty.classList.remove("hidden");
  if (!threads.length) {
    activeThreadId = createThread("Thread 1");
  }
  restoreThread(activeThreadId);
  detailsPanel.classList.remove("hidden");
  detailsContent.innerHTML = '<div class="details-empty"><strong>No campaign selected</strong><p>Select a playbook or campaign event to view report, content, segment and execution context.</p></div>';
  modalBody.scrollLeft = 0;
  document.querySelectorAll(".panel-nav-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector('.panel-nav-btn[data-target="chat"]')?.classList.add("active");
  renderModalCalendar();
  updateMonthPicker();
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 1800);
}

document.getElementById("createCampaignBtn").onclick = (e) => {
  e.stopPropagation();
  createMenu.classList.toggle("hidden");
};

document.getElementById("openAgentFlowBtn").onclick = () => {
  createMenu.classList.add("hidden");
  modalBackdrop.classList.remove("hidden");
  workspaceScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
  modalTitle.textContent = "Campaign Setup";
};

document.addEventListener("click", (e) => {
  if (!createMenu.contains(e.target) && e.target.id !== "createCampaignBtn") {
    createMenu.classList.add("hidden");
  }
});
document.getElementById("setupAi").onclick = () => openAskAiModal();
document.querySelectorAll(".playbook-item").forEach((item) => {
  const launch = () => {
    openAskAiModal();
    resetActiveThreadConversation();
    loadPlaybook(item.dataset.playbookId);
  };
  item.onclick = launch;
  const btn = item.querySelector(".review-btn");
  if (btn) btn.onclick = (e) => { e.stopPropagation(); launch(); };
});

document.getElementById("closeModal").onclick = () => modalBackdrop.classList.add("hidden");

document.querySelectorAll(".cal-mode").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".cal-mode").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    renderModalCalendar();
  };
});

layoutButtons.forEach((btn) => {
  btn.onclick = () => {
    layoutButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    calendarLayout = btn.dataset.layout;
    renderModalCalendar();
  };
});

function renderModalCalendar() {
  const widget = document.getElementById("calendarWidget");
  const events = generatedCampaigns.length ? [...baseCalendarEvents, ...generatedCampaigns] : [];
  widget.innerHTML = `<div class="legend"><span class="pre-l">Pre-scheduled</span><span class="delta-l">New AI Campaigns</span><span class="scheduled-l">Scheduled</span><span class="draft-l">Draft</span></div>`;
  if (!events.length && !csvWorkflowActive) {
    widget.innerHTML += `<div class="calendar-empty"><div><strong>No campaign plan yet</strong><br/>Start with a playbook or prompt to generate campaign timeline and calendar overlays.</div></div>`;
    return;
  }
  const target = document.createElement("div");
  widget.appendChild(target);
  if (csvWorkflowActive && calendarLayout !== "timeline") {
    renderSheetCalendar(target);
  } else if (calendarLayout === "timeline") {
    renderTimeline(target, events);
  } else {
    renderCalendar(target, events, currentMode);
  }
}

function renderSheetCalendar(container) {
  const rows = csvPreviewRows.length
    ? csvPreviewRows
    : generatedCampaigns.map((c, i) => {
        const d = normalizeEventDate(c);
        return {
          row: i + 1,
          date: d.toLocaleDateString(),
          weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
          slot: c.slot,
          channel: c.channel,
          segment: c.segment || c.audience || "-",
          template: c.template || "-",
          content: c.content || "-",
          status: c.status || "Draft",
        };
      });
  if (!rows.length) {
    container.innerHTML = '<div class="calendar-empty"><div><strong>No spreadsheet rows yet.</strong><br/>Attach a CSV to begin row-wise campaign planning.</div></div>';
    return;
  }
  container.innerHTML = `
    <div class="sheet-banner">
      <span>Spreadsheet view of campaign planning rows</span>
      <button class="report-cta" data-action="apply-csv-plan-middle">Create Calendar Draft Campaigns</button>
    </div>
    <div class="sheet-wrap">
      <table class="sheet-grid">
        <thead>
          <tr>
            <th>Row</th><th>Date</th><th>Day</th><th>Slot</th><th>Channel</th><th>Segment</th><th>Template</th><th>Content</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `<tr>
                <td>${r.row}</td>
                <td>${r.date}</td>
                <td>${r.weekday}</td>
                <td contenteditable="true" data-row="${r.row}" data-field="slot">${r.slot}</td>
                <td>${r.channel}</td>
                <td contenteditable="true" data-row="${r.row}" data-field="segment">${r.segment}</td>
                <td contenteditable="true" data-row="${r.row}" data-field="template">${r.template}</td>
                <td contenteditable="true" data-row="${r.row}" data-field="content">${r.content}</td>
                <td><span class="sheet-status">${r.status}</span></td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function applyCsvPlanWithProcessing(source = "Action") {
  appendUser(`${source}: Create calendar draft campaigns from spreadsheet`);
  const step = appendThinking("Processing spreadsheet edits...");
  setCalendarLoading(true);
  setTimeout(() => {
    step.textContent = "Creating campaign drafts and validating schedule...";
  }, 1800);
  setTimeout(() => {
    step.remove();
    generatedCampaigns = buildCampaignsFromCsvRows();
    csvWorkflowActive = false;
    lastArtifactType = "campaign-plan";
    alignCalendarToCampaigns(generatedCampaigns);
    appendAI("CSV plan created successfully. Calendar and timeline have been refreshed from the latest spreadsheet edits.");
    addCampaignCard();
    setCalendarLoading(false);
    renderModalCalendar();
    renderPageCalendar();
    focusCalendarAndDetails();
    snapshotThread();
  }, 5000);
}

function renderTimeline(container, events) {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const inView = events
    .filter((e) => {
      const d = normalizeEventDate(e);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => normalizeEventDate(a) - normalizeEventDate(b));
  if (!inView.length) {
    container.innerHTML = '<div class="calendar-empty"><div><strong>No timeline entries for this month.</strong><br/>Try another month or generate a new plan.</div></div>';
    return;
  }
  container.innerHTML = `<div class="timeline-wrap">${inView
    .map((e, idx) => {
      const d = normalizeEventDate(e);
      return `<div class="timeline-row">
        <div class="timeline-day">Day ${idx + 1}</div>
        <div class="timeline-card">
          <div class="timeline-meta">
            <span class="timeline-pill">${e.channel}</span>
            <span>${e.time || e.slot}</span>
            <span class="timeline-pill ai">AI-Recommended</span>
          </div>
          <h4>${e.title || e.name}</h4>
          <p class="timeline-src">Source: ${e.template || "Behavioral Recommendation Engine"} • ${d.toDateString()}</p>
          <div class="timeline-copy">${e.content || "Campaign content generated by AskAI."}</div>
          <div class="timeline-actions">
            <button>View Full Content</button>
            <button>Edit Content</button>
            <button>View Recommendation</button>
            <span>See Alternatives (3)</span>
          </div>
        </div>
      </div>`;
    })
    .join("")}</div>`;
}

function appendUser(text) {
  const empty = document.getElementById("askAiEmpty");
  if (empty) empty.classList.add("hidden");
  const node = document.createElement("div");
  node.className = "msg user";
  node.textContent = text;
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  snapshotThread();
}

function appendAI(text) {
  const node = document.createElement("div");
  node.className = "msg ai";
  node.textContent = text;
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  snapshotThread();
}

function appendAIHtml(html) {
  const node = document.createElement("div");
  node.className = "msg ai";
  node.innerHTML = html;
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  snapshotThread();
}

function appendThinking(text) {
  const node = document.createElement("div");
  node.className = "msg thinking";
  node.textContent = text;
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  snapshotThread();
  return node;
}

function addCampaignCard() {
  const card = document.createElement("div");
  card.className = "flow-card plan-card";
  card.innerHTML = `<h4>Campaign Plan</h4><p>I translated your request into a practical campaign schedule with balanced timing across channels.</p><p>Click this card to review and focus the proposed plan details.</p>`;
  card.onclick = () => {
    renderModalCalendar();
    showCampaignReport();
    focusAskAiAndOverlay();
  };
  chatLog.appendChild(card);
}

function showDetails(event) {
  detailsPanel.classList.remove("hidden");
  const eventDate = normalizeEventDate(event);
  detailsContent.innerHTML = `
    <p><strong>Name:</strong> ${event.name}</p>
    <p><strong>Status:</strong> ${event.status}</p>
    <p><strong>Channel:</strong> ${event.channel}</p>
    <p><strong>Schedule:</strong> ${eventDate.toLocaleDateString()} ${event.slot}</p>
    <p><strong>Audience:</strong> ${event.audience || "General"}</p>
    <p><strong>Goal:</strong> ${event.goal || "Engagement"}</p>
    <p><strong>Notes:</strong> AI balanced audience overlap and send-time fatigue.</p>`;
}

function createGeneratedData() {
  generationCycle += 1;
  const cycleBase = addDays(todayDate, generationCycle * 10);
  const at = (d) => addDays(cycleBase, d);
  return [
    { name: `askai_cart_save_push_c${generationCycle}`, date: at(2), slot: "09:00", status: "Draft", source: "delta", channel: "Push", audience: "Cart Abandoners", goal: "Conversion", segment: "Cart value > $50", reach: "82,500", template: "Push_Cart_Urgency_v2", content: "Still thinking? Your cart is waiting with a 10% save." },
    { name: `askai_cart_save_email_c${generationCycle}`, date: at(4), slot: "12:30", status: "Scheduled", source: "delta", channel: "Email", audience: "Cart Abandoners", goal: "Revenue", segment: "Cart Abandoners D1", reach: "64,100", template: "Email_Cart_Recovery_Modern", content: "Complete your checkout before prices change this week." },
    { name: `askai_weekend_drop_c${generationCycle}`, date: at(8), slot: "17:00", status: "Draft", source: "delta", channel: "WhatsApp", audience: "Bargain Seekers", goal: "CTR", segment: "Coupon Clickers 60d", reach: "41,300", template: "WA_Weekend_Deal_Quick", content: "Weekend drop is live. Tap to unlock member-only picks." },
    { name: `askai_reengage_browser_c${generationCycle}`, date: at(12), slot: "15:00", status: "Scheduled", source: "delta", channel: "Browser", audience: "Inactive Users", goal: "Retention", segment: "Inactive 21d", reach: "36,900", template: "Web_Reengage_Flash", content: "New arrivals selected for you are now available." },
    { name: `askai_vip_bundle_email_c${generationCycle}`, date: at(17), slot: "10:00", status: "Scheduled", source: "delta", channel: "Email", audience: "VIP", goal: "AOV", segment: "VIP High AOV", reach: "11,800", template: "Email_VIP_Bundle_Premium", content: "Exclusive bundles curated for our premium shoppers." },
  ];
}

function showCampaignReport() {
  const items = generatedCampaigns.length ? generatedCampaigns : [];
  if (!items.length) {
    detailsContent.innerHTML = "<p>No campaign plan available yet.</p>";
    return;
  }
  const summary = items.reduce((acc, c) => acc + Number(String(c.reach || "0").replace(/,/g, "")), 0);
  detailsPanel.classList.remove("hidden");
  detailsContent.innerHTML =
    `<h4>Campaign Report Summary</h4>
     <p><strong>Total campaigns:</strong> ${items.length} | <strong>Estimated reach:</strong> ${summary.toLocaleString()} users</p>
     <div style="margin:8px 0 12px;">
       <button class="report-cta" data-action="create-all-drafts">Create All Prompt Delta as Drafts</button>
     </div>
     <table style="width:100%; border-collapse:collapse; font-size:12px;">
       <thead>
         <tr>
           <th style="text-align:left; border-bottom:1px solid #e5ebf6; padding:6px;">Campaign</th>
           <th style="text-align:left; border-bottom:1px solid #e5ebf6; padding:6px;">Segment</th>
           <th style="text-align:left; border-bottom:1px solid #e5ebf6; padding:6px;">Channel</th>
           <th style="text-align:left; border-bottom:1px solid #e5ebf6; padding:6px;">Reach</th>
           <th style="text-align:left; border-bottom:1px solid #e5ebf6; padding:6px;">Template</th>
           <th style="text-align:left; border-bottom:1px solid #e5ebf6; padding:6px;">Content</th>
         </tr>
       </thead>
       <tbody>
         ${items
           .map(
             (c) => `<tr>
               <td style="border-bottom:1px solid #f0f3fa; padding:6px;">${c.name}<div style="color:#7a86a0;">${normalizeEventDate(c).toLocaleDateString()} • ${c.slot} • ${c.status}</div></td>
               <td style="border-bottom:1px solid #f0f3fa; padding:6px;">${c.segment || c.audience || "-"}</td>
               <td style="border-bottom:1px solid #f0f3fa; padding:6px;">${c.channel}</td>
               <td style="border-bottom:1px solid #f0f3fa; padding:6px;">${c.reach || "-"}</td>
               <td style="border-bottom:1px solid #f0f3fa; padding:6px;">${c.template || "-"}</td>
               <td style="border-bottom:1px solid #f0f3fa; padding:6px;">${c.content || "-"}
                 ${c.source === "delta" ? `<div style="margin-top:6px;"><button class="report-cta" data-action="create-one-draft" data-name="${c.name}">Create Draft</button></div>` : ""}
               </td>
             </tr>`
           )
           .join("")}
       </tbody>
     </table>`;
}

function createDraftFromDeltaByName(name) {
  const found = generatedCampaigns.find((c) => c.name === name && c.source === "delta");
  if (!found) return false;
  const exists = draftedFromDelta.some((d) => d.name === found.name);
  if (exists) return false;
  draftedFromDelta.push({
    name: found.name,
    channel: found.channel,
    createdBy: "agent@demoecommerce.com",
    createdOn: `${normalizeEventDate(found).toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${found.slot}`,
    rate: "0.00%",
    status: "Draft",
  });
  renderCampaignRows();
  return true;
}

function runAskAiFlow(inputText, sourceLabel) {
  appendUser(`${sourceLabel}: ${inputText}`);
  lastArtifactType = "campaign-plan";
  const think = appendThinking("Thinking...");
  setCalendarLoading(true);
  setTimeout(() => {
    think.textContent = "Processing campaign intent and channel mix...";
  }, 700);
  setTimeout(() => {
    think.remove();
    const delta = createGeneratedData();
    generatedCampaigns = [...generatedCampaigns, ...delta];
    if (sourceLabel !== "Decision") {
      csvWorkflowActive = false;
      csvPreviewRows = [];
    }
    alignCalendarToCampaigns(generatedCampaigns);
    appendAI(`I added ${delta.length} campaigns from this prompt. Overlay now shows pre-scheduled campaigns and new AI campaigns for cycle ${generationCycle}.`);
    addCampaignCard();
    setCalendarLoading(false);
    renderModalCalendar();
    renderPageCalendar();
    focusPanel("calendar");
  }, 5000);
}

function applyCsvEditsFromPrompt(text) {
  const lower = text.toLowerCase();
  let changed = 0;
  if (lower.includes("fill missing")) {
    csvPreviewRows = csvPreviewRows.map((r) => {
      const updated = { ...r };
      if (updated.segment === "Missing") { updated.segment = "AI Segment Cluster"; changed += 1; }
      if (updated.template === "Missing") { updated.template = "AI_Template_v1"; changed += 1; }
      if (updated.content === "Missing") { updated.content = "AI generated campaign copy"; changed += 1; }
      updated.status = "Edited";
      return updated;
    });
  } else {
    const m = lower.match(/row\\s*(\\d+)/);
    if (m) {
      const rowN = Number(m[1]);
      csvPreviewRows = csvPreviewRows.map((r) => {
        if (r.row !== rowN) return r;
        const updated = { ...r, status: "Edited" };
        if (lower.includes("segment")) { updated.segment = "Updated Segment"; changed += 1; }
        if (lower.includes("template")) { updated.template = "Updated_Template"; changed += 1; }
        if (lower.includes("content")) { updated.content = "Updated content from chat prompt"; changed += 1; }
        return updated;
      });
    }
  }
  if (changed > 0) {
    appendAI(`Applied ${changed} CSV edits from your prompt. Review the spreadsheet and click CSV Plan when ready.`);
    renderModalCalendar();
    return true;
  }
  return false;
}

function buildCampaignsFromCsvRows() {
  return csvPreviewRows.map((r, i) => ({
    name: `csv_plan_${i + 1}`,
    title: `CSV Campaign Row ${r.row}`,
    content: r.content,
    date: new Date(r.date),
    slot: r.slot,
    time: r.slot,
    status: r.status === "Ready" ? "Scheduled" : "Draft",
    source: "delta",
    channel: r.channel,
    audience: r.segment,
    goal: "Conversion",
    segment: r.segment,
    reach: `${(i + 1) * 1800}`,
    template: r.template,
  }));
}

function submitBackgroundJob(label, onDone, durationMs = 9000) {
  appendAI(`${label}: Job submitted. We are processing this in the backend.`);
  const progress = appendThinking("Processing...");
  setTimeout(() => {
    progress.textContent = "Creating campaigns and validating templates...";
  }, Math.min(2500, durationMs * 0.35));
  setTimeout(() => {
    progress.textContent = "Almost done. Finalizing schedule and quality checks...";
  }, Math.min(6000, durationMs * 0.7));
  setTimeout(() => {
    progress.remove();
    onDone();
    snapshotThread();
  }, durationMs);
}

function loadPlaybook(playbookId) {
  const pb = playbookCatalog[playbookId];
  if (!pb) return;
  appendUser(`Playbook selected: ${pb.name}`);
  const progress = appendThinking("Processing playbook context...");
  setTimeout(() => {
    progress.textContent = "Analyzing segments, channels, FCaps and opportunity model...";
  }, 1200);
  setTimeout(() => {
    progress.textContent = "Building campaign timeline and content variants...";
  }, 2800);
  setTimeout(() => {
    progress.remove();
    appendAI(`${pb.summary} ${pb.details}`);
    const proposedCampaigns = pb.timeline.map((t, i) => ({
      name: `${playbookId.replace(/-/g, "_")}_${i + 1}`,
      title: t.title,
      content: t.content,
      date: addDays(todayDate, i * 3 + 1),
      slot: t.time,
      time: t.time,
      status: i % 2 === 0 ? "Scheduled" : "Draft",
      source: "delta",
      channel: t.channel,
      audience: "Playbook Segment",
      goal: "Conversion",
      segment: pb.segments[i % pb.segments.length],
      reach: `${(i + 2) * 1200}`,
      template: `${t.channel}_Playbook_Template`,
    }));
    pendingPlaybook = { playbookId, pb, campaigns: proposedCampaigns };
    appendAIHtml(
      `<strong>${pb.name}</strong><br/>Playbook analyzed. Review the calendar plan card below when ready.`
    );
    const card = document.createElement("div");
    card.className = "flow-card plan-card";
    card.dataset.action = "apply-playbook-calendar";
    card.innerHTML = `<h4>Calendar Plan</h4><p>Prepared ${proposedCampaigns.length} campaign steps in timeline format.</p><p>Click to create overlay and load report.</p>`;
    chatLog.appendChild(card);
    showPlaybookDetails(pb, playbookId, proposedCampaigns);
    renderModalCalendar();
    snapshotThread();
  }, 4500);
}

function showPlaybookDetails(pb, playbookId, campaigns) {
  const channels = [...new Set(campaigns.map((c) => c.channel))].join(", ");
  const reach = campaigns.reduce((acc, c) => acc + Number(String(c.reach || "0").replace(/,/g, "")), 0).toLocaleString();
  detailsContent.innerHTML = `
    <div class="details-report">
      <h4>${pb.name}</h4>
      <p>${pb.details}</p>
      <div class="report-grid">
        <div><span>Opportunity</span><strong>${pb.opportunity}</strong></div>
        <div><span>Predicted Dollars</span><strong>${pb.predictedDollars}</strong></div>
        <div><span>Campaign Reach</span><strong>${reach}</strong></div>
        <div><span>Estimated Cost</span><strong>${pb.estimatedCost}</strong></div>
      </div>
      <div class="report-meta">
        <p><strong>Channels:</strong> ${channels}</p>
        <p><strong>Time Window:</strong> ${pb.timeWindow}</p>
        <p><strong>DND:</strong> ${pb.dnd}</p>
        <p><strong>FCaps:</strong> ${pb.fcaps}</p>
        <p><strong>Segments Targeted:</strong> ${pb.segments.join(", ")}</p>
      </div>
      <div class="template-carousel">
        ${campaigns
          .map(
            (c) => `<article class="template-card">
              <h5>${c.channel} • ${c.title || c.name}</h5>
              <p><strong>Template:</strong> ${c.template}</p>
              <p><strong>Content:</strong> ${c.content}</p>
            </article>`
          )
          .join("")}
      </div>
    </div>
  `;
}

document.getElementById("sendChat").onclick = () => {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  if (csvWorkflowActive && lastArtifactType === "csv-plan") {
    appendUser(`Prompt: ${text}`);
    const applied = applyCsvEditsFromPrompt(text);
    if (!applied) appendAI("I did not detect a direct CSV edit. Try: 'fill missing' or 'row 2 segment/content/template'.");
    return;
  }
  runAskAiFlow(text, "Prompt");
};

document.getElementById("csvInput").addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  runCsvSimulation(file.name);
  e.target.value = "";
});

document.querySelectorAll(".agent-chip").forEach((chip) => {
  chip.onclick = () => runAskAiFlow(chip.dataset.prompt, "Chip");
});

newThreadBtn.onclick = () => {
  snapshotThread();
  const id = createThread(`Thread ${threads.length + 1}`);
  restoreThread(id);
};

newChatBtn.onclick = () => {
  resetActiveThreadConversation();
  showToast("Started a fresh conversation in this thread.");
};

toggleThreadsBtn.onclick = () => {
  threadsPanel.classList.toggle("hidden");
  renderThreadsPanel();
};

monthPicker.addEventListener("change", () => {
  if (!monthPicker.value) return;
  const [y, m] = monthPicker.value.split("-").map(Number);
  calendarCursor = new Date(y, m - 1, 1);
  renderModalCalendar();
});

prevMonthBtn.onclick = () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
  updateMonthPicker();
  renderModalCalendar();
};

nextMonthBtn.onclick = () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
  updateMonthPicker();
  renderModalCalendar();
};

todayBtn.onclick = () => {
  calendarCursor = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  updateMonthPicker();
  renderModalCalendar();
};

function focusPanel(targetKey) {
  const node = targetKey === "chat" ? chatPanel : targetKey === "calendar" ? calendarPanel : detailsPanel;
  const maxScroll = modalBody.scrollWidth - modalBody.clientWidth;
  const desired = node.offsetLeft - (modalBody.clientWidth - node.clientWidth) / 2;
  const left = Math.max(0, Math.min(maxScroll, desired));
  modalBody.scrollTo({ left, behavior: "smooth" });
  document.querySelectorAll(".panel-nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.target === targetKey));
}

function focusCalendarAndDetails() {
  const midpoint = (calendarPanel.offsetLeft + detailsPanel.offsetLeft) / 2;
  const maxScroll = modalBody.scrollWidth - modalBody.clientWidth;
  const desired = midpoint - modalBody.clientWidth * 0.35;
  const left = Math.max(0, Math.min(maxScroll, desired));
  modalBody.scrollTo({ left, behavior: "smooth" });
  document.querySelectorAll(".panel-nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.target === "calendar"));
}

function focusAskAiAndOverlay() {
  const midpoint = (chatPanel.offsetLeft + calendarPanel.offsetLeft) / 2;
  const maxScroll = modalBody.scrollWidth - modalBody.clientWidth;
  const desired = midpoint - modalBody.clientWidth * 0.35;
  const left = Math.max(0, Math.min(maxScroll, desired));
  modalBody.scrollTo({ left, behavior: "smooth" });
  document.querySelectorAll(".panel-nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.target === "chat"));
}

function runCsvSimulation(fileName) {
  appendUser(`Attached CSV: ${fileName}`);
  csvWorkflowActive = true;
  lastArtifactType = "csv-plan";
  calendarLayout = "calendar";
  csvPreviewRows = Array.from({ length: 5 }, (_, i) => {
    const d = addDays(todayDate, i + 1);
    return {
      row: i + 1,
      date: d.toLocaleDateString(),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      slot: ["09:00", "12:00", "15:00", "18:00", "20:00"][i],
      channel: ["Email", "Push", "WhatsApp", "Email", "Push"][i],
      segment: i % 2 ? "Missing" : "High Intent Users",
      template: i % 3 ? "Promo_Template_v2" : "Missing",
      content: i % 2 ? "Missing" : "Auto-generated draft copy",
      status: "Queued",
    };
  });
  renderModalCalendar();
  const step = appendThinking("Thinking...");
  setCalendarLoading(false);
  setTimeout(() => {
    step.textContent = "Processing CSV rows (1/5): mapping campaign_name, channel, schedule...";
    csvPreviewRows = csvPreviewRows.map((r, idx) => ({ ...r, status: idx < 2 ? "Mapped" : "Queued" }));
    renderModalCalendar();
  }, 500);
  setTimeout(() => {
    step.textContent = "Processing CSV rows (3/5): validating channel, frequency, timezone...";
    csvPreviewRows = csvPreviewRows.map((r, idx) => ({ ...r, status: idx < 4 ? "Validated" : "Queued" }));
    renderModalCalendar();
  }, 1100);
  setTimeout(() => {
    step.textContent = "Processing CSV rows (5/5): checking segment and content completeness...";
    csvPreviewRows = csvPreviewRows.map((r) => ({ ...r, status: (r.segment === "Missing" || r.content === "Missing" || r.template === "Missing") ? "Needs Input" : "Ready" }));
    renderModalCalendar();
  }, 1700);
  setTimeout(() => {
    step.remove();
    appendAIHtml(
      "<strong>Validation summary</strong><br/>" +
      "Processed 5 campaign rows.<br/>" +
      "Missing <strong>segment</strong> in 2 rows and <strong>content</strong> in 3 rows.<br/>" +
      "Rows impacted: 2, 4 (segment) and 1, 3, 5 (content)."
    );
    const card = document.createElement("div");
    card.className = "flow-card plan-card";
    card.innerHTML = `
      <h4>CSV Plan</h4>
      <p>Editable spreadsheet prepared and validated.</p>
      <p>Review/adjust rows, then create campaign drafts from this plan.</p>
      <div style="margin-top:8px;">
        <button class="report-cta" data-action="apply-csv-plan">Create Calendar Draft Campaigns</button>
      </div>`;
    chatLog.appendChild(card);
    const actions = document.createElement("div");
    actions.className = "choice-row";
    actions.innerHTML =
      '<button class="choice-btn" data-csv-action="fill">Use AI to fill missing fields</button>' +
      '<button class="choice-btn" data-csv-action="review">I will edit in spreadsheet</button>' +
      '<button class="choice-btn" data-csv-action="apply">Create CSV Plan</button>';
    chatLog.appendChild(actions);
    chatLog.scrollTop = chatLog.scrollHeight;
    snapshotThread();
  }, 2400);
}

function setCalendarLoading(isLoading) {
  const widget = document.getElementById("calendarWidget");
  if (!widget) return;
  if (isLoading) {
    widget.innerHTML = `
      <div class="legend"><span class="pre-l">Pre-scheduled</span><span class="delta-l">New AI Campaigns</span><span class="scheduled-l">Scheduled</span><span class="draft-l">Draft</span></div>
      <div class="calendar-loading"><div><div class="loader"></div><div>AskAI is processing campaign orchestration...</div></div></div>`;
  }
}

document.querySelectorAll(".panel-nav-btn").forEach((btn) => {
  btn.onclick = () => {
    focusPanel(btn.dataset.target);
  };
});

modalBody.addEventListener("scroll", () => {
  const viewportCenter = modalBody.scrollLeft + modalBody.clientWidth / 2;
  const panels = [
    { key: "chat", center: chatPanel.offsetLeft + chatPanel.clientWidth / 2 },
    { key: "calendar", center: calendarPanel.offsetLeft + calendarPanel.clientWidth / 2 },
    { key: "details", center: detailsPanel.offsetLeft + detailsPanel.clientWidth / 2 },
  ];
  const active = panels.reduce((best, p) =>
    Math.abs(p.center - viewportCenter) < Math.abs(best.center - viewportCenter) ? p : best
  ).key;
  document.querySelectorAll(".panel-nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.target === active);
  });
});

chatLog.addEventListener("click", (e) => {
  const csvCta = e.target.closest('[data-action="apply-csv-plan"]');
  if (csvCta) {
    applyCsvPlanWithProcessing("CTA");
    return;
  }
  const applyCard = e.target.closest('[data-action="apply-playbook-calendar"]');
  if (applyCard && pendingPlaybook) {
    generatedCampaigns = pendingPlaybook.campaigns;
    alignCalendarToCampaigns(generatedCampaigns);
    calendarLayout = "timeline";
    layoutButtons.forEach((b) => b.classList.toggle("active", b.dataset.layout === "timeline"));
    appendAI("Calendar overlay created from playbook plan. Timeline view is now loaded.");
    showPlaybookDetails(pendingPlaybook.pb, pendingPlaybook.playbookId, generatedCampaigns);
    renderModalCalendar();
    renderPageCalendar();
    focusCalendarAndDetails();
    snapshotThread();
    return;
  }
  const cta = e.target.closest(".report-cta");
  if (cta?.dataset.action === "create-playbook") {
    const pb = cta.dataset.playbook;
    submitBackgroundJob(`Create Playbook: ${pb}`, () => {
      appendAI("Backend job complete. Playbook campaigns have been created and queued.");
      generatedCampaigns.forEach((g) => createDraftFromDeltaByName(g.name));
      showCampaignReport();
      renderPageCalendar();
    }, 10000);
    return;
  }
  const btn = e.target.closest(".choice-btn");
  if (!btn) return;
  const csvAction = btn.dataset.csvAction;
  if (csvAction) {
    if (csvAction === "fill") {
      applyCsvEditsFromPrompt("fill missing");
    } else if (csvAction === "review") {
      appendAI("Spreadsheet is editable. Update cells directly in the center panel or use chat prompts like 'row 2 content'.");
    } else if (csvAction === "apply") {
      const cta = chatLog.querySelector('[data-action="apply-csv-plan"]');
      if (cta) cta.click();
    }
    return;
  }
  const wrap = btn.closest(".choice-row");
  if (wrap) {
    wrap.querySelectorAll(".choice-btn").forEach((b) => (b.disabled = true));
  }
  if (btn.dataset.choice === "without") {
    runAskAiFlow("Proceed without missing segment/content fields", "Decision");
  } else {
    runAskAiFlow("Use AI to fill missing segment and content fields before creating campaigns", "Decision");
  }
});

document.getElementById("calendarWidget").addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="apply-csv-plan-middle"]');
  if (!btn) return;
  applyCsvPlanWithProcessing("Middle Panel CTA");
});

detailsPanel.addEventListener("click", (e) => {
  const btn = e.target.closest(".report-cta");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "create-all-drafts") {
    submitBackgroundJob("Create Drafts", () => {
      const deltas = generatedCampaigns.filter((c) => c.source === "delta");
      let created = 0;
      deltas.forEach((d) => {
        if (createDraftFromDeltaByName(d.name)) created += 1;
      });
      appendAI(`Backend job complete. Created ${created} prompt-delta campaigns as drafts for future review.`);
      showCampaignReport();
    }, 8000);
    return;
  }
  if (action === "create-one-draft") {
    const name = btn.dataset.name;
    submitBackgroundJob(`Create Draft: ${name}`, () => {
      const created = createDraftFromDeltaByName(name);
      appendAI(created ? `Backend job complete. Created draft for ${name}.` : `${name} is already created as draft.`);
      showCampaignReport();
    }, 6500);
    return;
  }
  if (action === "create-playbook") {
    const pb = btn.dataset.playbook;
    submitBackgroundJob(`Create Playbook: ${pb}`, () => {
      appendAI("Backend job complete. Playbook campaigns have been created and queued.");
      generatedCampaigns.forEach((g) => createDraftFromDeltaByName(g.name));
      showCampaignReport();
      renderPageCalendar();
    }, 10000);
  }
});

document.getElementById("calendarWidget").addEventListener("blur", (e) => {
  const cell = e.target;
  if (!cell || !cell.dataset || !cell.dataset.row || !cell.dataset.field) return;
  const rowN = Number(cell.dataset.row);
  const field = cell.dataset.field;
  const value = cell.textContent.trim() || "Missing";
  csvPreviewRows = csvPreviewRows.map((r) => (r.row === rowN ? { ...r, [field]: value, status: "Edited" } : r));
  snapshotThread();
}, true);
