import localeMessageBox from '@/components/message-box/locale/zh-CN';
import localeLogin from '@/views/login/locale/zh-CN';

import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN';

import localeMonitor from '@/views/dashboard/monitor/locale/zh-CN';

import localeCardList from '@/views/list/card/locale/zh-CN';
import localeSearchTable from '@/views/list/search-table/locale/zh-CN';

import localeGroupForm from '@/views/form/group/locale/zh-CN';
import localeStepForm from '@/views/form/step/locale/zh-CN';

import localeBasicProfile from '@/views/profile/basic/locale/zh-CN';

import localeDataAnalysis from '@/views/visualization/data-analysis/locale/zh-CN';
import localeMultiDAnalysis from '@/views/visualization/multi-dimension-data-analysis/locale/zh-CN';

import localeError from '@/views/result/error/locale/zh-CN';
import localeSuccess from '@/views/result/success/locale/zh-CN';

import locale403 from '@/views/exception/403/locale/zh-CN';
import locale404 from '@/views/exception/404/locale/zh-CN';
import locale500 from '@/views/exception/500/locale/zh-CN';

import localeUserInfo from '@/views/user/info/locale/zh-CN';
import localeUserSetting from '@/views/user/setting/locale/zh-CN';

import localeTerminal from '@/views/terminal/locale/zh-CN';

import localeSettings from './zh-CN/settings';

const localeExecutor = {
  'menu.manage.executor': '执行器',

  'executor': '执行器',
  'executor.name': '名称',
  'executor.name.placeholder': '请输入要查询的执行器名称',
  'executor.command': '命令',
  'executor.info': '描述',
  'executor.platform': '平台',
  'executor.saveExecutor': '编辑执行器',
};

const localeJob = {
  'menu.repository.jobList': '作业',
  'menu.repository.jobTimer': '定时任务',
  'menu.repository.jobBundleScript': '脚本',
  'menu.repository.daemonJob': '常驻任务',
  'menu.runStatus.runList': '运行列表',
  'menu.runStatus.scheduleList': '调度记录',
  'menu.runStatus.execList': '执行记录',

  'job': '作业',
  'job.eid': '执行id',
  'job.executor': '执行器',
  'job.name': '作业名称',
  'job.name.placeholder': '请输入作业名称',
  'job.info': '描述',
  'job.code': '代码',
  'job.detail': '作业详情',
  'job.runHistory': '执行记录',
  'job.type': '作业类型',
  'job.type.default': '单一',
  'job.type.bundle': '批量',
  'job.scheduleType': '调度类型',
  'job.scheduleType.once': '单次',
  'job.scheduleType.timer': '定时',
  'job.scheduleType.daemon': '常驻',
  'job.scheduleType.workflow': '工作流',
  'job.script': '脚本',
  'job.schedule': '作业调度',
  'job.schedule.name': '调度名称',
  'job.schedule.detail': '调度详情',
  'job.save': '保存作业',
  'job.upload_file': '上传文件',
  'job.upload_file.tooltip': '文件会被上传至/tmp目录, 且可于作业中直接访问',
  'job.selectJob': '选择作业',
  'job.bindIp': '执行IP',
  'job.endpoint': '执行实例',
  'job.endpoint.tips': '人工输入时，换行符分割数据',
  'job.endpoint.title': '选择执行实例',
  'job.dispatch': '推送',
  'job.workDir': '执行目录',
  'job.workDir.tips': '默认取Jiascheduler Agent执行目录',
  'job.workUser': '执行用户',
  'job.workUser.tips': '默认取Jiascheduler Agent执行用户',
  'job.timeout': '执行超时',
  'job.timeout.tips': '脚本执行超时后自动kill进程, 单位秒',
  'job.maxParallel': '最大并行',
  'job.maxParallel.tips':
    '相同的作业允许同时执行的最大并行数，超过这个数值则忽略执行，定时器和单次执行是分开计数的。对于定时器，如果作业的执行耗时大于定时周期，设置一个合适的并行数可以有效避免作业进程耗费过多内存',
  'job.displayOnDashboard': '大盘显示',
  'job.tab.basic': '基本',
  'job.tab.advance': '高级',
  'job.completedCallback': '回调通知',
  'job.completedCallback.url.placeholder': '请输入url',
  'job.completedCallback.header': '请输入header头: 格式 ',
  'job.completedCallback.triggerOn': '触发方式',
  'job.completedCallback.triggerOn.all': '全部触发',
  'job.completedCallback.triggerOn.error': '仅在执行失败时触发',
  'job.completedCallback.header.error': '请填写JSON格式数据',
  'job.completedCallback.url.error': '请填写正确的url地址',
  'job.arg': '参数',
  'job.arg.name': '参数名',
  'job.arg.validator.name.required': '参数名必填',
  'job.arg.val': '参数值',
  'job.arg.defaultVal': '默认值',
  'job.arg.info': '描述',
  'job.arg.tips':
    '基于"Handlebars templating language" (https://handlebarsjs.com/) 实现参数模板化，你可以在代码中直接使用 {name} 访问定义的参数',

  'job.timer': '定时器',
  'job.saveTimer': '保存定时器',
  'job.timerExpr': '表达式',
  'job.timerExpr.tooltips':
    '采用cron格式, 定时器保存时系统可自动校验, 并支持预览下次执行时间 (基于 https://github.com/hexagon/croner-rust 实现)',
  'job.timer.info': '简介',
  'job.timer.name': '名称',
  'job.timer.name.placeholder': '请输入名称',
  'job.timerExpr.validation.error':
    '时间表达式不正确，请确实检查时间表达式是否正确，例如: 0 * * * * *',

  'job.daemon': '常驻任务',
  'job.saveDaemon': '保存常驻任务',
  'job.daemon.name': '名称',
  'job.daemon.name.placeholder': '请输入常驻任务名称',
  'job.daemon.info': '描述',
  'job.daemon.restartInterval': '重启间隔',
  'job.daemon.restartInterval.tooltips': '失败后重启间隔, 单位秒',
  'job.daemon.restartInterval.placeholder': '请输入重启间隔',
  'job.daemon.restartInterval.tips': '失败后重启间隔, 单位秒',

  'jobBundleScript.name': '名称',
  'jobBundleScript.validator.eid.required': '请选择脚本',
  'jobBundleScript.validator.condExpr.required': '请填写计算表达式',
  'jobBundleScript.info': '脚本描述',
  'jobBundleScript.code': '代码',
  'jobBundleScript.saveBundleScript': '保存脚本',
  'jobBundleScript.condExpr.tooltips':
    '运算表达式, 支持形如 $v > 10 or $v < 5 的运算逻辑，$v代指脚本的处理结果',

  'job.quickStart': '快速启动',
  'job.schedule.name.placeholder': '请输入调度名称',

  'job.start': '启动',
  'job.stop': '停止',
  'job.kill': '强杀进程',
  'job.startTimer': '启动定时器',
  'job.stopTimer': '停止定时器',
  'job.scheduleId': '调度编号',
  'job.scheduleName': '调度名称',

  'job.exitStatus': '退出状态',
  'job.lastExitStatus': '上次退出状态',
  'job.scheduleStatus': '调度状态',
  'job.runStatus': '运行状态',

  'job.startTime': '开始时间',
  'job.endTime': '结束时间',

  'job.prevTime': '上次执行',
  'job.nextTime': '下次执行',

  'job.clear.records': '清空执行记录',
  'job.action.confirm.clear.records': '确认要清空执行记录么？',

  'job.action.confirm.start': '确认要启动么？',
  'job.action.confirm.startTimer': '确认要启动定时器么？',
  'job.action.confirm.stop': '确认要停止么？',
  'job.action.confirm.stopTimer': '确认要停止定时器么？',
  'job.action.confirm.startSupervising': '确认要开启运行守护么',
  'job.action.confirm.stopSupervising': '确认要关闭运行守护么',
  'job.action.confirm.deleteSchedule':
    '确认要删除该调度记录吗？这将会同时清空执行记录, 后续你可以从运行状态停止正在运行的作业',
  'job.action.confirm.deleteRunningStatus':
    '确认要删除该运行状态么？这将会清空对应的执行记录',
  'job.action.confirm.deleteJob':
    '确认要删除该作业么，这将会清空对应的调度记录和执行记录',
  'job.action.confirm.deleteJobTimer': '确认要删除该定时器么',
  'job.action.confirm.deleteJobSupervisor': '确认要删除该常驻任务么? ',
  'job.action.confirm.deleteBundleScript': '确认要删除该脚本? ',
  'job.action': '动作',
  'job.schedule.dispatchResult': '推送结果',

  'job.runDetail': '运行详情',
  'job.output': '输出',
  'job.elapsed': '耗时',
  'job.execResult': '执行结果',

  'job.scheduleName.placeholder': '请输入名称',
};

const localeWorkflow = {
  'menu.workflow': '工作流',
  'menu.workflow.define': '流程定义',
  'menu.workflow.edit': '编辑流程',
  'menu.workflow.processList': '流程记录',
  'menu.workflow.timer': '定时流程',

  'workflow.name': '流程名',
  'workflow.info': '描述',
  'workflow.version': '版本',
  'workflow.save': '保存流程',
  'workflow.startProcess': '启动流程',
  'workflow.versionName': '版本名',
  'workflow.versionInfo': '版本信息',
  'workflow.saveVersion': '保存版本',
  'workflow.basicInfo': '基础信息',
  'workflow.processDefine': '流程定义',
  'workflow.nodeConfig': '节点配置',
  'workflow.nodeConfig.name': '节点名',
  'workflow.nodeConfig.id': '节点ID',
  'workflow.nodeConfig.id.tips': '节点ID, 必须全局唯一',
  'workflow.nodeConfig.TaskType': '任务类型',
  'workflow.nodeConfig.TaskType.job': '作业',
  'workflow.nodeConfig.TaskType.custom': '自定义',
  'workflow.nodeConfig.task.args': '作业参数',
  'workflow.processName': '流程名',
  'workflow.processStatus': '流程状态',
  'workflow.processArgs': '流程参数',
  'workflow.processArgs.tips': '重置流程节点中的作业参数，执行实例',
  'workflow.node': '节点',
  'workflow.nodeStatus': '节点状态',
  'workflow.process.detail': '流程详情',
  'workflow.condition': '条件配置',
  'workflow.condition.isJoinAll': '等待所有前置条件都满足再执行当前任务',
  'workflow.bindIp': '执行ip',
  'workflow.nodeConfig.static': '静态',
  'workflow.nodeConfig.dynamic': '动态',
  'workflow.nodeConfig.selectTasks.tips': '请选择任务',
  'workflow.action.confirm.delete': '确认要删除该流程么? ',
  'workflow.clear.records': '清空流程记录',
  'workflow.action.confirm.clear.records': '确认要清空流程记录么？',
  'workflow.defaultExecutionEndpoint': '默认执行实例',
  'workflow.defaultExecutionEndpoint.tips':
    '当流程中未预先定义执行实例时你可以在这里统一设置所有节点的默认执行实例，你也可以在流程参数中重置执行实例',

  'workflow.timer.save': '保存定时器',
  'workflow.timer.name': '名称',
  'workflow.timer.info': '描述',
  'workflow.timer.schedule': '定时器调度',
  'workflow.timer.timezone': '时区',
  'workflow.timer.expr': '表达式',
  'workflow.timer.refWorkflow': '工作流',
  'workflow.timer.refWorkflow.workflowPlaceholder': '请选择工作流',
  'workflow.timer.refWorkflow.versionPlaceholder': '请选择版本',
  'workflow.timer.refWorkflow.validation.error': '定时器未关联工作流',
  'workflow.timer.nextPreview': '下次执行时间预览',
  'workflow.timer.status': '状态',
  'workflow.timer.running': '运行中',
  'workflow.timer.notStarted': '未启动',
  'workflow.timer.startupError': '启动失败',

  'workflow.userVariables': '用户变量',
  'workflow.userVariables.name': '变量名',
  'workflow.userVariables.val': '值',
  'workflow.userVariables.defVal': '默认值',
  'workflow.userVariables.info': '描述',
  'workflow.userVariables.tips':
    '这些自定义变量可在定义工作流的条件中，或者脚本中直接访问。注意：在脚本中需以环境变量的形式访问',
  'workflow.userVariables.validation.error': '用户变量设置错误',

  'workflow.process.timer': '定时器',
};

const localeBase = {
  group: '分组',
};

const localeUserAndPermissions = {
  'menu.manage.usersAndPermissions': '用户和权限',

  'user': '用户',
  'user.activity': '启用中',
  'user.saveUser': '编辑用户',
  'user.avatar': '头像',
  'user.username': '用户名',
  'user.nickname': '昵称',
  'user.keyword': '关键词',
  'user.keyword.placeholder': '支持用户名，用户昵称，手机号，邮箱搜索',
  'user.phone': '手机',
  'user.email': '邮箱',
  'user.email.placeholder': '请输入邮箱地址',
  'user.gender': '性别',
  'user.gender.male': '男',
  'user.gender.female': '女',
  'user.password': '密码',
  'user.password.tooltips':
    '创建账号时会生成随机密码，由于不支持再次查看，请妥善保存。当忘记密码时管理员可直接重置',
  'user.introduction': '个人简介',
  'user.introduction.placeholder': '不超过200字',
  'user.role': '角色',
  'user.login': '登录',
  'user.logout': '退出',

  'role.setRole': '角色设置',
  'role.name': '角色',
  'role.name.placeholder': '请输入角色名, 如admin, user',
  'role.info': '简介',
  'role.permission': '权限',

  'role.userTotal': '关联人数',

  'role.bind': '绑定',
  'role.bindInstance': '绑定实例',
  'role.bindInstance.validate.required': '请先选择实例',
  'role.bindInstanceGroup': '绑定实例分组',
  'role.bindInstanceGroup.validate.required': '请先选择实例分组',
  'role.bindUser': '绑定用户',
  'role.bindUser.validate.required': '请先选择绑定用户',
};

const localeInstance = {
  'menu.manage.instanceList': '全部实例',
  'instance': '实例',
  'instance.ip': 'ip',
  'instance.status': '状态',
  'instance.detail': '实例详情',
  'instance.password': '密码',
  'instance.password.tooltips': '实例密码不支持查看，但管理员可以直接修改',
  'instance.server': '服务器',
  'instance.online': '在线',
  'instance.offline': '下线',
  'instance.grant': '授权',
  'instance.ip.placeholder': '请输入要查询的IP',
  'instance.updateInstance': '修改实例',
  'instance.namespace': '命名空间',
  'instance.info': '简介',
  'instance.instanceGroup': '分组',
  'instance.sysUser': '系统用户',
  'instance.namespace.tooltips':
    '为防止IP冲突, 允许设置实例所属的命名空间, 当前支持default空间',
  'instance.userServer': '用户服务器',
  'instanceGroup.updateInstanceGroup': '修改实例分组',
  'instanceGroup.name': '分组',
  'instanceGroup.name.placeholder': '请输入分组名称',
  'instanceGroup.info': '描述',
};

const localeInstall = {
  'menu.install': '安装',
  'menu.install.initConfig': '初始化配置',

  'install.finish': '完成安装',
  'install.initDatabase': '连接数据库',
  'install.initData': '初始化数据',
  'install.initAdminUser': '设置管理员账号',
  'install.defaultDockerAddr': '如果采用默认容器部署，可直接使用如下配置地址',

  'install.httpServer.bindAddr': 'Http服务地址',
  'install.httpServer.tips.bindAddr': '控制台访问地址，eg: "0.0.0.0:9090"',

  'install.database.type': '数据库类型',
  'install.database.type.mysql': 'Mysql',
  'install.database.type.redis': 'Redis',
  'install.database.address': 'Database连接地址',
  'install.database.tips.address': '数据库连接地址，eg：',
  'install.redis.address': 'Redis连接地址',
  'install.redis.tips.address': 'redis连接地址，eg：',

  'install.admin.username': '管理员',
  'install.admin.password': '密码',
  'install.cometSecret': 'comet密钥',
  'install.cometSecret.tips':
    'comet密钥，用于comet通信认证,表单中已自动配置默认值，如果需要修改请保证comet与agent采用相同的密钥',

  'install.success.title': '提交成功',
  'install.success.subTitle': '表单提交成功！',
  'install.button.again': '再次创建',
  'install.button.view': '查看详情',
  'install.button.login': '登陆',
  'install.description.title': '安装说明',
  'install.description.text':
    '安装完成后系统会生成配置文件<config>，如果存在此安装文件系统则认为已经完成安装，会在下次访问时跳转至登陆页面。' +
    '如果你想要重新安装，可以直接删除该配置文件。你也可以在启动时设置--config参数，重新指定此配置文件生成路径',
};

const localeTeam = {
  'menu.user.team': '团队管理',
  'team.name': '团队',
  'team.select.placeholder': '选择团队',
  'team.modal.addTitle': '创建团队',
  'team.modal.editTitle': '编辑团队',
  'team.modal.teamName': '团队名称',
  'team.modal.teamInfo': '团队描述',
  'team.add.user': '添加用户',
  'team.member.username': '用户名称',
  'team.member.createdTime': '创建时间',
  'team.member.isAdmin': '类型',
};

const localeTag = {
  'tag.name': '标签',
};

export default {
  'app.name': 'Jiascheduler 调度平台',

  'menu.dashboard': '仪表盘',
  'menu.assets': '我的资产',
  'menu.assets.server': '服务器',
  'menu.server.dashboard': '仪表盘-服务端',
  'menu.server.workplace': '工作台-服务端',
  'menu.server.monitor': '实时监控-服务端',
  'menu.list': '列表页',
  'menu.repository': '我的仓库',
  'menu.runStatus': '运行状态',
  'menu.manage': '管理',
  'menu.result': '结果页',
  'menu.exception': '异常页',
  'menu.form': '表单页',
  'menu.profile': '详情页',
  'menu.visualization': '数据可视化',
  'menu.user': '个人中心',
  'menu.apiDoc': '接口文档',
  'menu.faq': '常见问题',
  'menu.terminal': '终端',
  'navbar.docs': '文档中心',
  'navbar.action.locale': '切换为中文',

  'columns.index': '#',
  'columns.sn': '序号',
  'columns.name': '名称',
  // size
  'columns.size.mini': '迷你',
  'columns.size.small': '偏小',
  'columns.size.medium': '中等',
  'columns.size.large': '偏大',
  // actions
  'columns.actions.refresh': '刷新',
  'columns.actions.density': '密度',
  'columns.actions.columnSetting': '列设置',

  'columns.createdTime': '创建时间',
  'columns.updatedTime': '更新时间',
  'columns.createdUser': '创建人',
  'columns.updatedUser': '更新人',

  'form.select': '选择',
  'form.selectAll': '选择全部',
  'form.search': '查询',
  'form.reset': '重置',
  'form.save': '保存',
  'form.add': '新增',
  'form.submit': '提交',
  'form.submit.success': '提交成功',

  'operations': '操作',
  'operations.create': '新建',
  'operations.view': '查看',
  'operations.edit': '编辑',
  'operations.dispatch': '启动',
  'operations.download': '下载',
  'operations.websshLogin': '登录',
  'operations.quickStart': '快速启动',
  'operations.start': '启动',
  'operations.stop': '停止',
  'operations.startTimer': '启动定时器',
  'operations.stopTimer': '停止定时器',
  'operations.startSupervising': '启动',
  'operations.stopSupervising': '停止',
  'operations.update': '修改',
  'operations.granted': '授权',
  'operations.delete': '删除',
  'operations.delete.confirm': '您确定要删除这条数据么?',
  'operations.set': '设置',
  'operations.next': '下一步',

  ...localeJob,
  ...localeWorkflow,
  ...localeExecutor,

  ...localeUserAndPermissions,
  ...localeInstance,
  ...localeInstall,
  ...localeBase,

  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,

  ...localeMonitor,
  ...localeSearchTable,
  ...localeCardList,
  ...localeStepForm,
  ...localeGroupForm,
  ...localeBasicProfile,
  ...localeDataAnalysis,
  ...localeMultiDAnalysis,
  ...localeSuccess,
  ...localeError,
  ...locale403,
  ...locale404,
  ...locale500,
  ...localeUserInfo,
  ...localeUserSetting,
  ...localeTerminal,
  ...localeTeam,
  ...localeTag,
};
