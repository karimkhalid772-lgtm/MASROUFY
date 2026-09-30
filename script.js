const CURRENT_KEY = "masroufy_current_user";
const USERS_KEY = "masroufy_users";

const id = localStorage.getItem(CURRENT_KEY);

if (!id) {
  location.href = "login.html";
}

const users = JSON.parse(
  localStorage.getItem(USERS_KEY) || "[]"
);

const currentUser = users.find(
  user => user.id === id
);

if (!currentUser) {

  localStorage.removeItem(CURRENT_KEY);

  location.href = "login.html";
}

const keys = {

  transactions:
    `masroufy_transactions_${id}`,

  categories:
    `masroufy_categories_${id}`,

  budgets:
    `masroufy_budgets_${id}`

};

const defaultCategories = [

  {
    id: "food",
    name: "أكل",
    type: "expense"
  },

  {
    id: "transport",
    name: "مواصلات",
    type: "expense"
  },

  {
    id: "shopping",
    name: "تسوق",
    type: "expense"
  },

  {
    id: "bills",
    name: "فواتير",
    type: "expense"
  },

  {
    id: "entertainment",
    name: "ترفيه",
    type: "expense"
  },

  {
    id: "education",
    name: "تعليم",
    type: "expense"
  },

  {
    id: "salary",
    name: "مرتب",
    type: "income"
  },

  {
    id: "freelance",
    name: "Freelance",
    type: "income"
  },

  {
    id: "other-income",
    name: "دخل آخر",
    type: "income"
  }

];

let transactions = JSON.parse(
  localStorage.getItem(keys.transactions) || "[]"
);

let categories =
  JSON.parse(
    localStorage.getItem(keys.categories) || "null"
  ) || defaultCategories;

let budgets = JSON.parse(
  localStorage.getItem(keys.budgets) || "[]"
);

let selectedMonth =
  new Date().toISOString().slice(0, 7);

let cashChart = null;
let expenseChart = null;

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  document.querySelectorAll(selector);

function save() {

  localStorage.setItem(
    keys.transactions,
    JSON.stringify(transactions)
  );

  localStorage.setItem(
    keys.categories,
    JSON.stringify(categories)
  );

  localStorage.setItem(
    keys.budgets,
    JSON.stringify(budgets
  ));
}

function money(number) {

  return `${Number(number || 0).toLocaleString(
    "ar-EG",
    {
      maximumFractionDigits: 2
    }
  )} ج.م`;
}

function dateNow() {

  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function monthKey(date) {

  const value = new Date(date);

  return `${value.getFullYear()}-${String(
    value.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatDate(date) {

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    "ar-EG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function catName(id) {

  const category =
    categories.find(
      category => category.id === id
    );

  return category
    ? category.name
    : "غير محدد";
}

function uid() {

  return crypto.randomUUID();
}

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
    );
}

$("#welcomeName").textContent =
  currentUser.name;

$("#monthPicker").value =
  selectedMonth;

$("#transactionDate").value =
  dateNow();

const proverbs = [

  "القرش الأبيض ينفع في اليوم الأسود.",

  "على قد لحافك مد رجليك.",

  "الاقتصاد نصف المعيشة.",

  "من حسبها صح، عاشها مرتاح."

];

const day = new Date().getDate();

$("#dailyProverb").textContent =
  proverbs[day % proverbs.length];

function toast(text) {

  const element = $("#toast");

  element.textContent = text;

  element.classList.add("show");

  setTimeout(() => {

    element.classList.remove("show");

  }, 2200);
}

function openModal(id) {

  $("#" + id).classList.add("open");
}

function closeModal(id) {

  $("#" + id).classList.remove("open");
}

function populateCategories() {

  const type =
    $("#transactionType").value;

  const list =
    categories.filter(
      category => category.type === type
    );

  $("#transactionCategory").innerHTML =
    list
      .map(
        category =>
          `<option value="${category.id}">
            ${escapeHTML(category.name)}
          </option>`
      )
      .join("");

  $("#categoryFilter").innerHTML =
    `<option value="all">
      كل التصنيفات
    </option>` +

    categories
      .map(
        category =>
          `<option value="${category.id}">
            ${escapeHTML(category.name)}
          </option>`
      )
      .join("");

  $("#budgetCategory").innerHTML =
    categories
      .filter(
        category =>
          category.type === "expense"
      )
      .map(
        category =>
          `<option value="${category.id}">
            ${escapeHTML(category.name)}
          </option>`
      )
      .join("");
}

function summary() {

  const current =
    transactions.filter(
      transaction =>
        monthKey(transaction.date) ===
        selectedMonth
    );

  const income =
    current
      .filter(
        transaction =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const expense =
    current
      .filter(
        transaction =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const allIncome =
    transactions
      .filter(
        transaction =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const allExpense =
    transactions
      .filter(
        transaction =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const previousDate =
    new Date(
      `${selectedMonth}-01T00:00:00`
    );

  previousDate.setMonth(
    previousDate.getMonth() - 1
  );

  const previousMonth =
    `${previousDate.getFullYear()}-${String(
      previousDate.getMonth() + 1
    ).padStart(2, "0")}`;

  const previousTransactions =
    transactions.filter(
      transaction =>
        monthKey(transaction.date) ===
        previousMonth
    );

  const previousIncome =
    previousTransactions
      .filter(
        transaction =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const previousExpense =
    previousTransactions
      .filter(
        transaction =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const previousNet =
    previousIncome - previousExpense;

  const net =
    income - expense;

  const growth =
    previousNet === 0
      ? net === 0
        ? 0
        : 100
      : (
          (net - previousNet) /
          Math.abs(previousNet)
        ) * 100;

  return {

    income,

    expense,

    net,

    balance:
      allIncome - allExpense,

    growth

  };
}

function renderStats() {

  const data = summary();

  $("#totalBalance").textContent =
    money(data.balance);

  $("#totalIncome").textContent =
    money(data.income);

  $("#totalExpense").textContent =
    money(data.expense);

  $("#netSavings").textContent =
    money(data.net);

  $("#growthRate").textContent =
    `${data.growth >= 0 ? "+" : ""}${data.growth.toFixed(1)}%`;
}

function renderRecent() {

  const list =
    transactions
      .filter(
        transaction =>
          monthKey(transaction.date) ===
          selectedMonth
      )
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date)
      )
      .slice(0, 6);

  if (!list.length) {

    $("#recentTransactions").innerHTML =
      `<div class="empty">
        مفيش معاملات في الشهر ده.
      </div>`;

    return;
  }

  $("#recentTransactions").innerHTML =
    list
      .map(
        transaction => `

          <div class="transaction-row">

            <div class="transaction-info">

              <div class="transaction-icon">
                ${
                  transaction.type === "income"
                    ? "↑"
                    : "↓"
                }
              </div>

              <div>

                <div class="transaction-name">
                  ${
                    escapeHTML(
                      transaction.note ||
                      catName(
                        transaction.category
                      )
                    )
                  }
                </div>

                <div class="transaction-date">

                  ${formatDate(
                    transaction.date
                  )}

                  ·

                  ${
                    escapeHTML(
                      catName(
                        transaction.category
                      )
                    )
                  }

                </div>

              </div>

            </div>

            <strong
              class="${transaction.type}"
            >

              ${
                transaction.type === "income"
                  ? "+"
                  : "-"
              }

              ${money(transaction.amount)}

            </strong>

          </div>
        `
      )
      .join("");
}

function renderTable() {

  const search =
    $("#searchInput")
      .value
      .trim()
      .toLowerCase();

  const type =
    $("#typeFilter").value;

  const category =
    $("#categoryFilter").value;

  let list =
    [...transactions]
      .filter(transaction => {

        const text =
          `${transaction.note || ""} ${
            catName(transaction.category)
          } ${
            transaction.account || ""
          }`.toLowerCase();

        return (

          (!search ||
            text.includes(search))

          &&

          (type === "all" ||
            transaction.type === type)

          &&

          (category === "all" ||
            transaction.category === category)

        );

      })
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date)
      );

  if (!list.length) {

    $("#transactionsTable").innerHTML = `

      <tr>

        <td colspan="6">

          <div class="empty">
            لا توجد معاملات.
          </div>

        </td>

      </tr>

    `;

    return;
  }

  $("#transactionsTable").innerHTML =
    list
      .map(
        transaction => `

          <tr>

            <td>
              ${formatDate(transaction.date)}
            </td>

            <td>
              ${escapeHTML(
                transaction.note || "—"
              )}
            </td>

            <td>
              ${escapeHTML(
                catName(
                  transaction.category
                )
              )}
            </td>

            <td>
              ${escapeHTML(
                transaction.account || "—"
              )}
            </td>

            <td
              class="${transaction.type}"
            >

              ${
                transaction.type === "income"
                  ? "+"
                  : "-"
              }

              ${money(transaction.amount)}

            </td>

            <td>

              <button
                class="delete-btn"
                data-delete="${transaction.id}"
              >
                حذف
              </button>

            </td>

          </tr>

        `
      )
      .join("");
}

function renderBudgets() {

  const currentMonth =
    selectedMonth;

  if (budgets.length) {

    $("#budgetsGrid").innerHTML =
      budgets
        .map(budget => {

          const spent =
            transactions
              .filter(
                transaction =>
                  transaction.type === "expense" &&
                  transaction.category ===
                    budget.category &&
                  monthKey(transaction.date) ===
                    currentMonth
              )
              .reduce(
                (total, transaction) =>
                  total +
                  Number(transaction.amount),
                0
              );

          const percentage =
            budget.limit
              ? Math.round(
                  spent /
                  budget.limit *
                  100
                )
              : 0;

          return `

            <article class="budget-card">

              <div class="budget-top">

                <strong>
                  ${escapeHTML(
                    catName(
                      budget.category
                    )
                  )}
                </strong>

                <button
                  class="delete-btn"
                  data-budget-delete="${budget.id}"
                >
                  حذف
                </button>

              </div>

              <div
                class="progress ${
                  percentage > 100
                    ? "over"
                    : ""
                }"
              >

                <div
                  style="width:${Math.min(
                    percentage,
                    100
                  )}%"
                ></div>

              </div>

              <div class="budget-meta">

                <span>
                  ${money(spent)}
                  من
                  ${money(budget.limit)}
                </span>

                <span>
                  ${percentage}%
                </span>

              </div>

            </article>

          `;

        })
        .join("");

  } else {

    $("#budgetsGrid").innerHTML = `
      <div class="panel empty">
        لسه مفيش ميزانيات.
      </div>
    `;
  }

  $("#dashboardBudgets").innerHTML =
    budgets
      .slice(0, 4)
      .map(budget => {

        const spent =
          transactions
            .filter(
              transaction =>
                transaction.type === "expense" &&
                transaction.category ===
                  budget.category &&
                monthKey(transaction.date) ===
                  selectedMonth
            )
            .reduce(
              (total, transaction) =>
                total +
                Number(transaction.amount),
              0
            );

        const percentage =
          Math.round(
            spent /
            budget.limit *
            100
          );

        return `

          <div
            class="budget-card"
            style="margin-bottom:9px"
          >

            <div class="budget-top">

              <strong>
                ${escapeHTML(
                  catName(
                    budget.category
                  )
                )}
              </strong>

              <span>
                ${percentage}%
              </span>

            </div>

            <div
              class="progress ${
                percentage > 100
                  ? "over"
                  : ""
              }"
            >

              <div
                style="width:${Math.min(
                  percentage,
                  100
                )}%"
              ></div>

            </div>

            <div class="budget-meta">

              <span>
                ${money(spent)}
              </span>

              <span>
                ${money(budget.limit)}
              </span>

            </div>

          </div>

        `;

      })
      .join("") ||

    `
      <div class="empty">
        أضف ميزانية علشان تتابع حدود مصاريفك.
      </div>
    `;
}

function renderCategories() {

  const expenseCategories =
    categories.filter(
      category =>
        category.type === "expense"
    );

  const incomeCategories =
    categories.filter(
      category =>
        category.type === "income"
    );

  $("#expenseCategories").innerHTML =
    expenseCategories
      .map(
        category => `

          <div class="category-item">

            <span>
              ${escapeHTML(
                category.name
              )}
            </span>

            <button
              class="delete-btn"
              data-cat-delete="${category.id}"
            >
              حذف
            </button>

          </div>

        `
      )
      .join("");

  $("#incomeCategories").innerHTML =
    incomeCategories
      .map(
        category => `

          <div class="category-item">

            <span>
              ${escapeHTML(
                category.name
              )}
            </span>

            <button
              class="delete-btn"
              data-cat-delete="${category.id}"
            >
              حذف
            </button>

          </div>

        `
      )
      .join("");
}

function renderCharts() {

  const labels = [];
  const income = [];
  const expense = [];

  const base =
    new Date(
      `${selectedMonth}-01T00:00:00`
    );

  for (let i = 5; i >= 0; i--) {

    const date =
      new Date(base);

    date.setMonth(
      date.getMonth() - i
    );

    const key =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    labels.push(
      date.toLocaleDateString(
        "ar-EG",
        {
          month: "short"
        }
      )
    );

    income.push(

      transactions
        .filter(
          transaction =>
            transaction.type === "income" &&
            monthKey(transaction.date) ===
              key
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount),
          0
        )

    );

    expense.push(

      transactions
        .filter(
          transaction =>
            transaction.type === "expense" &&
            monthKey(transaction.date) ===
              key
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount),
          0
        )

    );
  }

  if (cashChart) {
    cashChart.destroy();
  }

  cashChart =
    new Chart(
      $("#cashFlowChart"),
      {

        type: "line",

        data: {

          labels,

          datasets: [

            {
              label: "الدخل",

              data: income,

              tension: 0.35
            },

            {
              label: "المصروفات",

              data: expense,

              tension: 0.35
            }

          ]

        },

        options: {

          responsive: true,

          plugins: {

            legend: {

              labels: {
                color: "#dbe8eb"
              }

            }

          },

          scales: {

            x: {

              ticks: {
                color: "#8fa6b2"
              },

              grid: {
                color:
                  "rgba(255,255,255,.05)"
              }

            },

            y: {

              ticks: {
                color: "#8fa6b2"
              },

              grid: {
                color:
                  "rgba(255,255,255,.05)"
              }

            }

          }

        }

      }
    );

  const current =
    transactions.filter(
      transaction =>
        transaction.type === "expense" &&
        monthKey(transaction.date) ===
          selectedMonth
    );

  const categoryMap = {};

  current.forEach(transaction => {

    categoryMap[
      transaction.category
    ] =
      (
        categoryMap[
          transaction.category
        ] || 0
      ) +
      Number(transaction.amount);

  });

  const entries =
    Object.entries(categoryMap);

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart =
    new Chart(
      $("#expenseChart"),
      {

        type: "doughnut",

        data: {

          labels:
            entries.map(
              ([category]) =>
                catName(category)
            ),

          datasets: [

            {
              data:
                entries.map(
                  ([, value]) =>
                    value
                )
            }

          ]

        },

        options: {

          responsive: true,

          plugins: {

            legend: {

              position: "bottom",

              labels: {
                color: "#dbe8eb"
              }

            }

          }

        }

      }
    );

  $("#expenseMonthLabel").textContent =
    selectedMonth;
}

function renderAll() {

  populateCategories();

  renderStats();

  renderRecent();

  renderTable();

  renderBudgets();

  renderCategories();

  renderCharts();
}

function activate(section) {

  $$(".section")
    .forEach(
      element =>
        element.classList.remove(
          "active"
        )
    );

  $("#" + section)
    .classList.add("active");

  $$(".nav-link")
    .forEach(
      button =>
        button.classList.toggle(
          "active",
          button.dataset.section ===
            section
        )
    );

  const titles = {

    dashboard:
      "لوحة التحكم",

    transactions:
      "المعاملات",

    budgets:
      "الميزانيات",

    categories:
      "التصنيفات"

  };

  $("#pageTitle").textContent =
    titles[section];

  $("#sidebar")
    .classList.remove("open");
}

$$(".nav-link")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () =>
          activate(
            button.dataset.section
          )
      );

    }
  );

$("#mobileMenu").onclick = () => {

  $("#sidebar")
    .classList.toggle("open");

};

$("#monthPicker").onchange =
  event => {

    selectedMonth =
      event.target.value;

    renderAll();

  };

$("#quickAddBtn").onclick =
  () =>
    openModal(
      "transactionModal"
    );

$("#addTransactionBtn").onclick =
  () =>
    openModal(
      "transactionModal"
    );

$("#addBudgetBtn").onclick =
  () =>
    openModal(
      "budgetModal"
    );

$("#addCategoryBtn").onclick =
  () =>
    openModal(
      "categoryModal"
    );

$("#transactionType").onchange =
  populateCategories;

$("#searchInput").oninput =
  renderTable;

$("#typeFilter").onchange =
  renderTable;

$("#categoryFilter").onchange =
  renderTable;

$$("[data-close]")
  .forEach(
    button => {

      button.onclick =
        () =>
          closeModal(
            button.dataset.close
          );

    }
  );

$$(".modal")
  .forEach(
    modal => {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
          ) {

            modal.classList.remove(
              "open"
            );

          }

        }
      );

    }
  );

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      $$(".modal")
        .forEach(
          modal =>
            modal.classList.remove(
              "open"
            )
        );

    }

  }
);

$("#transactionForm")
  .onsubmit = event => {

    event.preventDefault();

    transactions.push({

      id: uid(),

      amount:
        Number(
          $("#transactionAmount").value
        ),

      type:
        $("#transactionType").value,

      category:
        $("#transactionCategory").value,

      date:
        $("#transactionDate").value,

      account:
        $("#transactionAccount").value,

      note:
        $("#transactionNote")
          .value
          .trim()

    });

    save();

    event.target.reset();

    $("#transactionDate").value =
      dateNow();

    populateCategories();

    closeModal(
      "transactionModal"
    );

    renderAll();

    toast(
      "تم حفظ المعاملة"
    );
  };

$("#budgetForm")
  .onsubmit = event => {

    event.preventDefault();

    const category =
      $("#budgetCategory").value;

    const limit =
      Number(
        $("#budgetLimit").value
      );

    const existing =
      budgets.find(
        budget =>
          budget.category ===
          category
      );

    if (existing) {

      existing.limit =
        limit;

    } else {

      budgets.push({

        id: uid(),

        category,

        limit

      });

    }

    save();

    event.target.reset();

    closeModal(
      "budgetModal"
    );

    renderAll();

    toast(
      "تم حفظ الميزانية"
    );
  };

$("#categoryForm")
  .onsubmit = event => {

    event.preventDefault();

    const name =
      $("#categoryName")
        .value
        .trim();

    const type =
      $("#categoryType").value;

    const exists =
      categories.some(
        category =>
          category.name.toLowerCase() ===
            name.toLowerCase() &&
          category.type === type
      );

    if (exists) {

      toast(
        "التصنيف موجود بالفعل"
      );

      return;
    }

    categories.push({

      id: uid(),

      name,

      type

    });

    save();

    event.target.reset();

    closeModal(
      "categoryModal"
    );

    renderAll();

    toast(
      "تمت إضافة التصنيف"
    );
  };

document.addEventListener(
  "click",
  event => {

    const deleteTransaction =
      event.target.closest(
        "[data-delete]"
      );

    if (
      deleteTransaction &&
      confirm(
        "هل تريد حذف المعاملة؟"
      )
    ) {

      transactions =
        transactions.filter(
          transaction =>
            transaction.id !==
            deleteTransaction.dataset.delete
        );

      save();

      renderAll();

      toast(
        "تم حذف المعاملة"
      );
    }

    const deleteBudget =
      event.target.closest(
        "[data-budget-delete]"
      );

    if (
      deleteBudget &&
      confirm(
        "هل تريد حذف الميزانية؟"
      )
    ) {

      budgets =
        budgets.filter(
          budget =>
            budget.id !==
            deleteBudget.dataset.budgetDelete
        );

      save();

      renderAll();

      toast(
        "تم حذف الميزانية"
      );
    }

    const deleteCategory =
      event.target.closest(
        "[data-cat-delete]"
      );

    if (
      deleteCategory &&
      confirm(
        "حذف التصنيف؟ المعاملات القديمة ستظل محفوظة."
      )
    ) {

      categories =
        categories.filter(
          category =>
            category.id !==
            deleteCategory.dataset.catDelete
        );

      save();

      renderAll();

      toast(
        "تم حذف التصنيف"
      );
    }

  }
);

$("#logoutBtn").onclick = () => {

  localStorage.removeItem(
    CURRENT_KEY
  );

  location.href =
    "login.html";
};

$("#exportBtn").onclick = () => {

  const data = {

    user: {

      name:
        currentUser.name,

      email:
        currentUser.email

    },

    transactions,

    budgets,

    categories,

    exportedAt:
      new Date().toISOString()

  };

  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    URL.createObjectURL(
      blob
    );

  link.download =
    `masroufy-${currentUser.name}.json`;

  link.click();

  URL.revokeObjectURL(
    link.href
  );
};

renderAll();