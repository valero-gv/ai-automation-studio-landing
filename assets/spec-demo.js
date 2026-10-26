(() => {
  "use strict";

  // Reviewed synthetic specification and catalog fixtures.
  // This is a scripted explanation, not a live matching or quoting service.
  const scenarios = [
    {
      id: "exact",
      tab: "Точные артикулы",
      title: "Артикулы совпали — менеджер проверяет строки",
      count: "2 входные строки → 2 в черновике",
      description: "Оба артикула найдены в учебном каталоге. Даже точное совпадение проходит проверку человеком.",
      rows: [
        {
          article: "CAB-315", description: "Кабель для участка А", quantity: "120 м",
          matches: ["CAB-315 · Кабель ВВГнг-LS 3×1,5"],
          issue: "Точный артикул. Нет предупреждений.",
          decision: "Проверил артикул и количество. Подтвердил 120 м.",
          status: "В черновике", tone: "ok"
        },
        {
          article: "BR-C16-1", description: "Автомат C16, 1 полюс", quantity: "6 шт",
          matches: ["BR-C16-1 · Автомат C16, 1 полюс"],
          issue: "Точный артикул. Нет предупреждений.",
          decision: "Проверил однополюсное исполнение. Подтвердил 6 шт.",
          status: "В черновике", tone: "ok"
        }
      ],
      quote: [
        { sku: "CAB-315", name: "Кабель ВВГнг-LS 3×1,5", quantity: "120 м", price: 78.5, amount: 9420 },
        { sku: "BR-C16-1", name: "Автомат C16, 1 полюс", quantity: "6 шт", price: 420, amount: 2520 }
      ],
      total: 11940,
      conclusion: "В черновике сохранены обе подтверждённые позиции. Цены взяты из учебного каталога."
    },
    {
      id: "ambiguity",
      tab: "Неоднозначное название",
      title: "«Автомат C16» — какой именно?",
      count: "1 входная строка → 1 в черновике",
      description: "Без артикула и числа полюсов есть два кандидата. Система не выбирает техническую замену за менеджера.",
      rows: [
        {
          article: "Артикул не указан", description: "Автомат C16", quantity: "6 шт",
          matches: ["BR-C16-1 · Автомат C16, 1 полюс", "BR-C16-3 · Автомат C16, 3 полюса"],
          issue: "Два варианта. Нужно уточнить число полюсов.",
          decision: "По учебному сценарию уточнил исполнение и выбрал BR-C16-1: 1 полюс, 6 шт. Реального запроса заказчику не было.",
          status: "Выбор человека", tone: "warning"
        }
      ],
      quote: [
        { sku: "BR-C16-1", name: "Автомат C16, 1 полюс", quantity: "6 шт", price: 420, amount: 2520 }
      ],
      total: 2520,
      conclusion: "В черновик попал только выбранный человеком товар. Одно- и трёхполюсный автоматы не считаются взаимозаменяемыми."
    },
    {
      id: "exceptions",
      tab: "Остаток и исключения",
      title: "Не все строки можно сразу включить в КП",
      count: "4 входные строки → 2 в черновике",
      description: "Недостаточный остаток, разные единицы, неизвестный товар и нулевое количество остаются видимыми.",
      rows: [
        {
          article: "CAB-325", description: "Кабель для участка Б", quantity: "150 м",
          matches: ["CAB-325 · Кабель ВВГнг-LS 3×2,5"],
          issue: "Нужно 150 м, условный остаток — 80 м. Требуется подтверждение срока.",
          decision: "По сценарию подтвердил условный срок для 150 м. Реальная дата поставки не получена и не рассчитывается.",
          status: "Условно подтверждено", tone: "warning"
        },
        {
          article: "DIN-1000", description: "DIN-рейка", quantity: "10 м",
          matches: ["DIN-1000 · DIN-рейка 35 мм, длина 1 м"],
          issue: "В заявке — метры, в каталоге — штуки. Автопересчёта нет.",
          decision: "Явно заменил единицу «м» на «шт» и подтвердил 10 штук длиной 1 м. Это решение человека.",
          status: "Единица исправлена", tone: "warning"
        },
        {
          article: "UNKNOWN-42", description: "Устройство без каталожного соответствия", quantity: "2 шт",
          matches: ["Соответствие не найдено"],
          issue: "В учебном каталоге нет подходящей позиции.",
          decision: "Исключил из этого черновика. Товар нужно уточнить; соответствие не придумано.",
          status: "Исключено · вопрос открыт", tone: "excluded"
        },
        {
          article: "BOX-12", description: "Щит на 12 модулей", quantity: "0 шт",
          matches: ["BOX-12 · Щит навесной на 12 модулей"],
          issue: "Нужно положительное количество.",
          decision: "Исключил строку с нулевым количеством. Количество нужно уточнить; система его не подставляет.",
          status: "Исключено · вопрос открыт", tone: "excluded"
        }
      ],
      quote: [
        { sku: "CAB-325", name: "Кабель ВВГнг-LS 3×2,5", quantity: "150 м", price: 119, amount: 17850 },
        { sku: "DIN-1000", name: "DIN-рейка 35 мм, длина 1 м", quantity: "10 шт", price: 150, amount: 1500 }
      ],
      total: 19350,
      conclusion: "Две строки исключены из черновика, но не потеряны. Товар UNKNOWN-42 и количество BOX-12 ещё нужно уточнить. Исходная заявка не закрыта полностью; вопросы клиенту не отправлялись."
    }
  ];

  const money = new Intl.NumberFormat("ru-RU", {
    style: "currency", currency: "RUB", minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function cell(label) {
    const td = element("td", "spec-demo-cell");
    td.append(element("span", "spec-demo-cell-label", label));
    td.firstElementChild.setAttribute("aria-hidden", "true");
    return td;
  }

  function header(labels) {
    const head = element("thead");
    const row = element("tr");
    labels.forEach((label) => {
      const th = element("th", "", label);
      th.scope = "col";
      row.append(th);
    });
    head.append(row);
    return head;
  }

  function reviewTable(scenario) {
    const table = element("table", "spec-demo-review");
    const caption = element("caption", "spec-demo-sr-only", "Исходные строки, сопоставление с каталогом и решения менеджера");
    table.append(caption, header(["01 / Исходная заявка", "02 / Сопоставление с каталогом", "03 / Проверка менеджером"]));
    const body = element("tbody");
    scenario.rows.forEach((item) => {
      const row = element("tr");
      const source = cell("01 / Исходная заявка");
      source.append(element("strong", "spec-demo-sku", item.article), element("p", "spec-demo-description", item.description), element("span", "spec-demo-quantity", item.quantity));
      const match = cell("02 / Сопоставление с каталогом");
      item.matches.forEach((candidate) => match.append(element("p", "spec-demo-candidate", candidate)));
      match.append(element("p", `spec-demo-issue spec-demo-issue--${item.tone}`, item.issue));
      const decision = cell("03 / Проверка менеджером");
      decision.append(element("p", "spec-demo-description", item.decision), element("span", `spec-demo-status spec-demo-status--${item.tone}`, item.status));
      row.append(source, match, decision);
      body.append(row);
    });
    table.append(body);
    return table;
  }

  function quoteTable(scenario) {
    const table = element("table", "spec-demo-quote");
    table.append(element("caption", "spec-demo-sr-only", "Черновик КП после заданных решений менеджера"), header(["Позиция каталога", "Количество", "Условная цена", "Сумма"]));
    const body = element("tbody");
    scenario.quote.forEach((item) => {
      const row = element("tr");
      const product = cell("Позиция каталога");
      product.append(element("strong", "spec-demo-sku", item.sku), element("span", "spec-demo-product-name", item.name));
      const quantity = cell("Количество");
      quantity.append(element("span", "", item.quantity));
      const price = cell("Условная цена");
      price.append(element("span", "", money.format(item.price)));
      const amount = cell("Сумма");
      amount.append(element("strong", "", money.format(item.amount)));
      row.append(product, quantity, price, amount);
      body.append(row);
    });
    table.append(body);
    return table;
  }

  function init(root, index) {
    if (root.dataset.specDemoReady) return;
    root.dataset.specDemoReady = "true";
    root.classList.add("spec-demo");
    const prefix = `spec-demo-${index}`;
    const notice = element("p", "spec-demo-notice");
    notice.append(element("strong", "", "Учебные данные. "), document.createTextNode("Цены и остатки условные. Решения менеджера заданы в сценариях — это не работающая обработка вашего файла."));
    const steps = element("ol", "spec-demo-steps");
    steps.setAttribute("aria-label", "Этапы обработки спецификации");
    ["Исходная заявка", "Сопоставление с каталогом", "Проверка менеджером", "Черновик КП"].forEach((text, step) => {
      const li = element("li");
      li.append(element("span", "spec-demo-step-number", String(step + 1).padStart(2, "0")), element("span", "", text));
      steps.append(li);
    });
    const tabs = element("div", "spec-demo-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Сценарий обработки спецификации");
    const buttons = [];
    const panels = [];

    scenarios.forEach((scenario, scenarioIndex) => {
      const tabId = `${prefix}-tab-${scenario.id}`;
      const panelId = `${prefix}-panel-${scenario.id}`;
      const button = element("button", "spec-demo-tab", scenario.tab);
      button.type = "button";
      button.id = tabId;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-selected", String(scenarioIndex === 0));
      button.tabIndex = scenarioIndex === 0 ? 0 : -1;
      tabs.append(button);
      buttons.push(button);

      const panel = element("div", "spec-demo-panel");
      panel.id = panelId;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
      panel.tabIndex = 0;
      panel.hidden = scenarioIndex !== 0;
      const heading = element("div", "spec-demo-heading");
      heading.append(element("h3", "spec-demo-title", scenario.title), element("span", "spec-demo-count", scenario.count));
      panel.append(heading, element("p", "spec-demo-intro", scenario.description), reviewTable(scenario));
      const quote = element("div", "spec-demo-result");
      const resultHeading = element("div", "spec-demo-result-heading");
      resultHeading.append(element("h4", "", "04 / Черновик КП"), element("span", "spec-demo-result-caption", "После заданных решений менеджера"));
      quote.append(resultHeading, quoteTable(scenario));
      const total = element("div", "spec-demo-total");
      total.append(element("span", "", "Учебный итог"), element("strong", "", money.format(scenario.total)));
      quote.append(total, element("p", "spec-demo-conclusion", scenario.conclusion));
      panel.append(quote);
      panels.push(panel);
    });

    function select(next, focus) {
      buttons.forEach((button, buttonIndex) => {
        const selected = buttonIndex === next;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        panels[buttonIndex].hidden = !selected;
      });
      if (focus) buttons[next].focus();
    }

    buttons.forEach((button, buttonIndex) => {
      button.addEventListener("click", () => select(buttonIndex, false));
      button.addEventListener("keydown", (event) => {
        const destinations = {
          ArrowRight: (buttonIndex + 1) % buttons.length,
          ArrowLeft: (buttonIndex + buttons.length - 1) % buttons.length,
          ArrowDown: (buttonIndex + 1) % buttons.length,
          ArrowUp: (buttonIndex + buttons.length - 1) % buttons.length,
          Home: 0,
          End: buttons.length - 1
        };
        if (Object.prototype.hasOwnProperty.call(destinations, event.key)) {
          event.preventDefault();
          select(destinations[event.key], true);
        }
      });
    });

    root.append(notice, steps, tabs, ...panels, element("p", "spec-demo-footnote", "Сопоставление по правилам на шести учебных товарах. Налоговые условия не определены. Не оферта. Подключения к МойСклад и актуальным остаткам в этом примере нет."));
  }

  document.querySelectorAll("[data-spec-demo]").forEach(init);
})();
