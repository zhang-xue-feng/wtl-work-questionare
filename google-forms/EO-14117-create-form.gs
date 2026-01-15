/**
 * EO-14117 合规岗位与平台使用情况调查问卷（内部使用）
 *
 * 运行后会在 Logs 输出 form 的编辑链接。
 */
function createEO14117FormWizard() {
  return createEO14117Form_({
    titleSuffix: "",
    // 普通版本：不使用/不确定都跳过“使用目的/不可访问影响”
    skipUseOptions: ["不使用", "不确定"],
    part2ExtraHelpText:
      "仅当选择“使用”，请继续填写该平台的使用目的与不可访问影响。\n",
  });
}

/**
 * 大数据工程师专用版本（独立出来重新评估影响）：
 * - 选择“不确定”也会进入“使用目的/不可访问影响”，避免因不确定导致信息缺失。
 */
function createEO14117BigDataEngineerFormWizard() {
  return createEO14117Form_({
    titleSuffix: "（大数据工程师专用）",
    // 大数据工程师版本：仅“不使用”跳过；“不确定”也继续评估影响
    skipUseOptions: ["不使用"],
    part2ExtraHelpText:
      "选择“使用/不确定”，请继续填写该平台的使用目的与不可访问影响。\n",
  });
}

/**
 * 运维/DBA 专用版本：
 * - 选择“不确定”也会进入影响评估（避免“我不确定”导致低估风险）。
 * - 影响选项与提示更贴近“隔离权限后无法执行操作/控制”的场景。
 */
function createEO14117OpsDBAFormWizard() {
  return createEO14117Form_({
    titleSuffix: "（运维/DBA 专用）",
    skipUseOptions: ["不使用"],
    part2ExtraHelpText:
      "选择“使用/不确定”，请继续填写该平台的使用目的与不可访问影响。\n",
    impactOptions: ["致命（无法执行操作/控制）", "影响效率（有备选方案）", "无影响"],
    impactHelpTextExtra:
      "（运维/DBA：请按“权限隔离后无法执行操作/控制”的情境评估影响）\n",
  });
}

function createEO14117Form_(cfg) {
  const titleBase = "EO-14117 合规岗位与平台使用情况调查问卷（内部使用）";
  const title = `${titleBase}${cfg.titleSuffix || ""}`;
  const description =
    "用途说明：本问卷仅用于评估各岗位角色的工作对平台和个人数据的依赖程度，以探索在 EO-14117 合规背景下与美国员工的合作方式，不涉及绩效考核或岗位调整。\n" +
    "请根据你当前日常工作中实际使用的系统与接触的信息填写。";

  const skipUseOptions = new Set(cfg.skipUseOptions || []);

  const form = FormApp.create(title);
  form.setDescription(description);

  // ========= Part 1 =========
  form.addSectionHeaderItem().setTitle("Part 1｜岗位与基本信息");

  form
    .addTextItem()
    .setTitle("1. 岗位名称（Job Title）")
    .setRequired(true);

  const part1FuncItem = form.addCheckboxItem().setTitle("2. 所属主要职能（可多选）");
  part1FuncItem
    .setChoices(
      [
        "技术 / 工程",
        "数据 / 算法",
        "内容审核 / 风控",
        "系统运维 / DBA",
        "运营",
        "市场 / 增长",
        "客服 / 用户支持",
        "产品",
        "管理 / 支持",
      ].map((v) => part1FuncItem.createChoice(v))
    )
    .showOtherOption(true)
    .setRequired(true);

  const part1LocItem = form.addMultipleChoiceItem().setTitle("3. 主要办公地点");
  part1LocItem
    .setChoices(
      [
        "中国大陆（北京）",
        "中国大陆（广州）",
        "中国香港",
        "美国",
        "马来西亚",
        "日本",
        "新加坡",
      ].map((v) => part1LocItem.createChoice(v))
    )
    .showOtherOption(true)
    .setRequired(true);

  // ========= Part 2 =========
  const part2Break = form
    .addPageBreakItem()
    .setTitle("Part 2｜你是否使用以下平台 / 系统（内部平台已标注域名）")
    .setHelpText(
      "填写说明（请阅读）\n" +
        "请按平台逐一填写：是否使用。\n" +
        (cfg.part2ExtraHelpText || "") +
        "如通过浏览器访问内部平台，请以域名是否匹配作为判断依据。"
    );

  const useOptions = ["使用", "不使用", "不确定"];
  const platformPurposeOptions = [
    "系统监控 / 运维",
    "技术开发 / 调试",
    "数据分析 / 查询",
    "报表查看（聚合）",
    "内容审核 / 用户行为判断",
    "风控 / 反欺诈",
    "运营管理（配置）",
    "客服 / 用户支持",
    "配置 / 权限管理",
    "仅支持性 / 行政用途",
  ];
  const impactOptions = cfg.impactOptions || ["完全无法进行", "影响效率（有备选方案）", "无影响"];

  const categories = [
    {
      header: "🟢 基础设施 / 监控 / 工具类（内部）",
      platforms: [
        { code: "A023", name: "ES 监控平台（Cerebro）", url: "https://cerebro.winktech.net" },
        { code: "A024", name: "任务调度平台（Airflow）", url: "https://duet-airflow.winktech.net" },
        { code: "A026", name: "大数据集群管理平台", url: "https://duet-cloudera.winktech.net" },
        { code: "A028", name: "Grafana 监控平台", url: "https://duet-grafana.winktech.net" },
        { code: "A030", name: "Python Web IDE（Jupyter）", url: "https://duet-jupyter.winktech.net" },
        { code: "A031", name: "Python Web IDE（Jupyter2）", url: "https://duet-jupyter2.winktech.net" },
        { code: "A032", name: "Kibana 平台", url: "https://duet-kibana.winktech.net" },
        { code: "A039", name: "Presto 服务运行状态", url: "https://duet-presto.winktech.net" },
        { code: "A040", name: "Prometheus 服务", url: "https://duet-prom.winktech.net" },
        { code: "A041", name: "离线计算集群监控", url: "https://duet-rm1.winktech.net" },
        { code: "A042", name: "离线计算集群监控 2", url: "https://duet-rm2.winktech.net" },
        { code: "A046", name: "密钥管理平台（Vault）", url: "https://duet-vault.winktech.net" },
        { code: "A047", name: "VictoriaMetrics 平台", url: "https://duet-vm.winktech.net" },
        { code: "A048", name: "测试自动化工具平台（ONES）", url: "https://ones.winktech.net" },
        { code: "A053", name: "统一权限管理平台（OSS IAM）", url: "https://oss.winktech.net" },
      ],
    },
    {
      header: "🟡 数据 / 分析 / AI 类（内部）",
      platforms: [
        { code: "A025", name: "数仓 DL 平台", url: "https://duet-bd.winktech.net" },
        { code: "A027", name: "Dify AI 工作流平台", url: "https://duet-dify.winktech.net" },
        { code: "A029", name: "数仓查询平台（Hue）", url: "https://duet-hue.winktech.net" },
        { code: "A043", name: "事件统计 / 埋点平台", url: "https://duet-statistic.winktech.net" },
        { code: "A044", name: "业务报表平台（聚合）", url: "https://duet-stats.winktech.net" },
        { code: "A045", name: "Tableau Web", url: "https://duet-tableau.winktech.net" },
      ],
    },
    {
      header: "🔴 业务 / 用户 / 内容类（内部）",
      platforms: [
        { code: "A036", name: "内容审核平台", url: "https://duet-moderation.winktech.net" },
        { code: "A038", name: "运营平台（含订单 / 支付）", url: "https://duet-operation.winktech.net" },
      ],
    },
    {
      header: "🔴 SaaS / 云平台（无公司内部域名）",
      note: "以下平台通常通过官方 SaaS 控制台访问，请以是否拥有账号或登录权限为判断依据。",
      platforms: [
        { code: "A049", name: "Infobip 短信平台" },
        { code: "A050", name: "CM 短信平台" },
        { code: "A051", name: "Telesign 短信平台" },
        { code: "A052", name: "Firebase" },
        { code: "A054", name: "GCP 控制台" },
        { code: "A055", name: "AWS 控制台" },
        { code: "A056", name: "AppsFlyer" },
        { code: "A057", name: "Google Play Console" },
        { code: "A058", name: "App Store Connect" },
        { code: "其他", name: "其他（填空）" },
      ],
    },
  ];

  // 展平成单个平台序列，便于“不使用 -> 跳下一个平台”的跳转
  const flatPlatforms = [];
  categories.forEach((cat) => {
    flatPlatforms.push({ _type: "category", header: cat.header, note: cat.note || "" });
    cat.platforms.forEach((p) => flatPlatforms.push({ _type: "platform", ...p }));
  });

  // 先创建所有 section（page breaks），收集引用；然后第二遍设置“是否使用”的跳转。
  const platformNodes = [];
  flatPlatforms.forEach((node) => {
    if (node._type === "category") {
      form.addSectionHeaderItem().setTitle(node.header).setHelpText(node.note || "");
      return;
    }

    const isOther = node.code === "其他";
    // 表单展示中不出现平台编号（如 A023），仅展示平台名称
    const headerTitle = isOther ? node.name : `${node.name}`;

    // 平台主页
    const mainBreak = form.addPageBreakItem().setTitle(headerTitle).setHelpText(node.url || "");

    if (isOther) {
      form.addTextItem().setTitle("平台名称 / 入口（填空）").setRequired(false);
    }

    const useItem = form
      .addMultipleChoiceItem()
      .setTitle(`${headerTitle}｜是否使用（单选）`)
      .setRequired(true);

    // 影响/目的页（仅当“使用”时进入）
    const impactBreak = form
      .addPageBreakItem()
      .setTitle(`${headerTitle}（不可访问的影响）`)
      .setHelpText(
        (node.url ? `${node.url}\n` : "") +
          (cfg.impactHelpTextExtra || "") +
          "若你选择“不使用/不确定”，系统将自动跳过本平台后续问题。"
      );

    const purposeItem = form
      .addCheckboxItem()
      .setTitle(`${headerTitle}｜使用它做什么？（可多选）`)
      .setHelpText("仅当你在上一题选择“使用”时填写。");
    purposeItem
      .setChoices(platformPurposeOptions.map((v) => purposeItem.createChoice(v)))
      .showOtherOption(true)
      .setRequired(false);

    const impactItem = form
      .addMultipleChoiceItem()
      .setTitle(`${headerTitle}｜不可访问对你这项工作造成什么影响（单选）`);
    impactItem.setChoices(impactOptions.map((v) => impactItem.createChoice(v))).setRequired(true);

    form.addParagraphTextItem().setTitle(`${headerTitle}｜备注（可选）`).setRequired(false);

    platformNodes.push({ code: node.code, mainBreak, impactBreak, useItem });
  });

  // ========= Part 3 =========
  // Part 2 - other platform (optional)
  const part2OtherBreak = form
    .addPageBreakItem()
    .setTitle("Part 2｜其他平台（可选）")
    .setHelpText("如你还使用了上述列表未覆盖的平台，可在此补充并说明其使用目的（均可选）。");

  form.addTextItem().setTitle("其他平台｜平台名称（可选）").setRequired(false);

  const otherPurposeItem = form
    .addCheckboxItem()
    .setTitle("其他平台｜使用目的（可选，多选）")
    .setHelpText("如未填写“其他平台名称”，本题可留空。");
  otherPurposeItem
    .setChoices(platformPurposeOptions.map((v) => otherPurposeItem.createChoice(v)))
    .showOtherOption(true)
    .setRequired(false);

  // 第二遍：设置“跳过选项”跳转到下一个平台主页（最后一个平台跳到 Part 2 其他平台）
  platformNodes.forEach((n, idx) => {
    const nextMain = idx + 1 < platformNodes.length ? platformNodes[idx + 1].mainBreak : part2OtherBreak;

    const choices = useOptions.map((opt) => {
      if (skipUseOptions.has(opt)) return n.useItem.createChoice(opt, nextMain);
      return n.useItem.createChoice(opt, n.impactBreak);
    });
    n.useItem.setChoices(choices);
  });

  // ========= Part 3 =========
  form.addPageBreakItem().setTitle("Part 3｜你是否接触以下信息类型（可多选）");
  const part4InfoItem = form.addCheckboxItem().setTitle("信息类型（可多选）");
  part4InfoItem
    .setChoices(
      [
        "用户账号 ID / 昵称",
        "聊天内容 / 用户生成内容（文本、图片、视频、语音）",
        "用于真人认证的人脸图片 / 视频 / 生物识别信息",
        "设备标识符（IDFA / GAID 等）",
        "精准定位信息",
        "用户手机号码",
        "用户支付 / 订单信息",
        "不接触任何用户信息",
      ].map((v) => part4InfoItem.createChoice(v))
    )
    .setRequired(false);

  // ========= Part 4 =========
  form.addPageBreakItem().setTitle("Part 4｜你通常接触的数据规模（年度累计估算）");

  const scaleItem = form.addMultipleChoiceItem().setTitle("你通常接触的数据规模（单选）");
  scaleItem
    .setChoices(
      ["单个或少量用户（<100）", "中等规模（100–10,000）", "大规模（10,000+）", "不清楚"].map((v) =>
        scaleItem.createChoice(v)
      )
    )
    .setRequired(false);

  const canCompleteItem = form
    .addMultipleChoiceItem()
    .setTitle("如果无法访问用户级数据，是否仍可完成主要工作？（单选）");
  canCompleteItem.setChoices(["可以", "部分可以", "不可以"].map((v) => canCompleteItem.createChoice(v))).setRequired(false);

  form.addParagraphTextItem().setTitle("（可选备注）").setRequired(false);

  // ========= Final (Optional) =========
  form
    .addParagraphTextItem()
    .setTitle("其他想说明 / 建议备注（可选）")
    .setHelpText("如对问卷内容、平台划分、权限选项或 EO-14117 合作方式有补充说明，请写在这里。")
    .setRequired(false);

  Logger.log("Form created: " + form.getEditUrl());
  return form.getEditUrl();
}

