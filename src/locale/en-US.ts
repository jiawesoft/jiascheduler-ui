import localeMessageBox from '@/components/message-box/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';

import localeWorkplace from '@/views/dashboard/workplace/locale/en-US';

import localeMonitor from '@/views/dashboard/monitor/locale/en-US';

import localeCardList from '@/views/list/card/locale/en-US';
import localeSearchTable from '@/views/list/search-table/locale/en-US';

import localeGroupForm from '@/views/form/group/locale/en-US';
import localeStepForm from '@/views/form/step/locale/en-US';

import localeBasicProfile from '@/views/profile/basic/locale/en-US';

import localeDataAnalysis from '@/views/visualization/data-analysis/locale/en-US';
import localeMultiDAnalysis from '@/views/visualization/multi-dimension-data-analysis/locale/en-US';

import localeError from '@/views/result/error/locale/en-US';
import localeSuccess from '@/views/result/success/locale/en-US';

import locale403 from '@/views/exception/403/locale/en-US';
import locale404 from '@/views/exception/404/locale/en-US';
import locale500 from '@/views/exception/500/locale/en-US';

import localeUserInfo from '@/views/user/info/locale/en-US';
import localeUserSetting from '@/views/user/setting/locale/en-US';

import localeTerminal from '@/views/terminal/locale/en-US';

import localeSettings from './en-US/settings';

const localeExecutor = {
  'menu.manage.executor': 'Executor',
  'executor': 'Executor',
  'executor.name': 'Name',
  'executor.name.placeholder': 'Please enter the name of the executor to query',
  'executor.command': 'Command',
  'executor.info': 'Description',
  'executor.platform': 'Platform',
  'executor.saveExecutor': 'Edit Executor',
};

const localeJob = {
  'menu.repository.jobList': 'Job List',
  'menu.repository.jobTimer': 'Timer',
  'menu.repository.jobBundleScript': 'Batch Task',
  'menu.repository.daemonJob': 'Daemon Job',
  'menu.runStatus.runList': 'Run List',
  'menu.runStatus.scheduleList': 'Schedule List',
  'menu.runStatus.execList': 'Execution List',

  'job': 'Job',
  'job.eid': 'Execution ID',
  'job.executor': 'Executor',
  'job.name': 'Job Name',
  'job.name.placeholder': 'Please enter the job name',
  'job.info': 'Description',
  'job.code': 'Code',
  'job.detail': 'Job Details',
  'job.runHistory': 'Execution History',
  'job.type': 'Job Type',
  'job.type.default': 'Default',
  'job.type.bundle': 'Job Bundle',
  'job.scheduleType': 'Schedule Type',
  'job.scheduleType.once': 'Once',
  'job.scheduleType.timer': 'Timer',
  'job.scheduleType.daemon': 'Daemon',
  'job.task': 'Task',
  'job.schedule': 'Job Schedule',
  'job.schedule.name': 'Schedule Name',
  'job.schedule.detail': 'Schedule Details',
  'job.save': 'Save Job',
  'job.upload_file': 'Upload File',
  'job.upload_file.tooltip':
    'The file will be uploaded to the /tmp directory and can be accessed directly in the job',
  'job.selectJob': 'Select Job',
  'job.bindIp': 'Execution IP',
  'job.endpoint': 'Endpoint',
  'job.dispatch': 'Dispatch',
  'job.workDir': 'Working Directory',
  'job.workUser': 'Working User',
  'job.timeout': 'Execution Timeout',
  'job.timeout.tips':
    'The script process will be automatically killed after the timeout, in seconds',
  'job.displayOnDashboard': 'Display on the dashboard',

  'job.timer': 'Timer',
  'job.saveTimer': 'Save Timer',
  'job.timerExpr': 'Timer Expression',
  'job.timerExpr.tooltips':
    'Comma-separated values (like 5,8,10) represent multiple time values. For example, a schedule of 0 2,14,26 * * * will execute at the 0th, 2nd, 14th, and 26th minutes of every hour.\nRanges can be specified with hyphens. A schedule of 0 0 * 5-10 * * will execute once an hour, but only on the 5th to 10th days of the month.\nThe day of the week can be specified as an abbreviation or full name. A schedule of 0 0 6 * * Sun,Sat will execute at 6 am on Sundays and Saturdays.',
  'job.timer.info': 'Description',
  'job.timer.name': 'Name',
  'job.timer.name.placeholder': 'Please enter a name',

  'job.daemon': 'Daemon Job',
  'job.daemon.name': 'Name',
  'job.daemon.name.placeholder': 'Place enter a name of daemon job',
  'job.daemon.info': 'Description',
  'job.daemon.restartInterval': 'Restart Interval',
  'job.daemon.restartInterval.placeholder': 'Please enter the restart interval',
  'job.daemon.restartInterval.tips':
    'Restart interval after failure, in seconds',

  'jobBundleScript.name': 'Name',
  'jobBundleScript.validator.eid.required': 'Please select a batch task',
  'jobBundleScript.validator.condExpr.required':
    'Please fill in the calculation expression',
  'jobBundleScript.info': 'Description',
  'jobBundleScript.code': 'Code',
  'jobBundleScript.saveBundleScript': 'Save Batch Task',
  'jobBundleScript.condExpr.tooltips':
    'Calculation expression, supporting operations like $v > 10 or $v < 5, where $v refers to the processing result of the batch job',

  'job.quickStart': 'Quick Start',
  'job.schedule.name.placeholder': 'Please enter the schedule name',

  'job.start': 'Start',
  'job.stop': 'Stop',
  'job.kill': 'Force kill process',
  'job.startTimer': 'Start Timer',
  'job.stopTimer': 'Stop Timer',
  'job.scheduleId': 'Schedule ID',
  'job.scheduleName': 'Schedule Name',

  'job.exitStatus': 'Exit Status',
  'job.lastExitStatus': 'Last Exit Status',
  'job.scheduleStatus': 'Schedule Status',
  'job.runStatus': 'Run Status',

  'job.startTime': 'Start Time',
  'job.endTime': 'End Time',

  'job.prevTime': 'Last Executed',
  'job.nextTime': 'Next Execution',

  'job.action.confirm.start': 'Are you sure you want to start?',
  'job.action.confirm.startTimer': 'Are you sure you want to start the timer?',
  'job.action.confirm.stop': 'Are you sure you want to stop?',
  'job.action.confirm.stopTimer': 'Are you sure you want to stop the timer?',
  'job.action': 'Action',
  'job.schedule.dispatchResult': 'Dispatch Status',

  'job.runDetail': 'Run Details',
  'job.output': 'Output',

  'job.scheduleName.placeholder': 'Please enter the name',
};

const localeBase = {
  group: 'Group',
};

const localeUserAndPermissions = {
  'menu.manage.usersAndPermissions': 'Users and Permissions',

  'user': 'User',
  'user.activity': 'Active',
  'user.saveUser': 'Edit User',
  'user.avatar': 'Avatar',
  'user.username': 'Username',
  'user.nickname': 'Nickname',
  'user.keyword': 'Keyword',
  'user.keyword.placeholder':
    'Supports searching by username, nickname, phone number, and email',
  'user.phone': 'Phone',
  'user.email': 'Email',
  'user.email.placeholder': 'Please enter your email address',
  'user.gender': 'Gender',
  'user.gender.male': 'Male',
  'user.gender.female': 'Female',
  'user.password': 'Password',
  'user.password.tooltips':
    'A random password will be generated when the account is created. Since it cannot be viewed again, please keep it safe. If you forget your password, the administrator can reset it directly',
  'user.introduction': 'Introduction',
  'user.introduction.placeholder': 'No more than 200 words',
  'user.role': 'Role',
  'user.login': 'Login',
  'user.logout': 'Logout',

  'role.setRole': 'Role Settings',
  'role.name': 'Role',
  'role.name.placeholder': 'Please enter the role name, e.g., admin, user',
  'role.info': 'Description',
  'role.permission': 'Permissions',

  'role.userTotal': 'Number of Associated Users',

  'role.bind': 'Bind',
  'role.bindInstance': 'Bind Instance',
  'role.bindInstance.validate.required': 'Please select an instance first',
  'role.bindInstanceGroup': 'Bind Instance Group',
  'role.bindInstanceGroup.validate.required':
    'Please select an instance group first',
  'role.bindUser': 'Bind User',
  'role.bindUser.validate.required': 'Please select a user to bind',
};

const localeInstance = {
  'menu.manage.instanceList': 'All Instances',
  'instance': 'Instance',
  'instance.ip': 'IP',
  'instance.status': 'Status',
  'instance.detail': 'Instance Details',
  'instance.password': 'Password',
  'instance.password.tooltips':
    'Instance password cannot be viewed, but can be directly modified by admin',
  'instance.server': 'Server',
  'instance.online': 'Online',
  'instance.offline': 'Offline',
  'instance.grant': 'Grant',
  'instance.ip.placeholder': 'Please enter the IP to search',
  'instance.updateInstance': 'Update Instance',
  'instance.namespace': 'Namespace',
  'instance.info': 'Description',
  'instance.instanceGroup': 'Group',
  'instance.sysUser': 'System User',
  'instance.namespace.tooltips':
    'To prevent IP conflicts, you can set the namespace for the instance. Currently, only the default namespace is supported',
  'instance.userServer': 'User Server',
  'instanceGroup.updateInstanceGroup': 'Update Instance Group',
  'instanceGroup.name': 'Group',
  'instanceGroup.name.placeholder': 'Please enter the group name',
  'instanceGroup.info': 'Description',
};

const localeInstall = {
  'menu.install': 'Install',
  'menu.install.initConfig': 'Initialize Configuration',

  'install.finish': 'Installation Complete',
  'install.initDatabase': 'Connect to Database',
  'install.initData': 'Initialize Data',
  'install.initAdminUser': 'Set Admin Account',

  'install.httpServer.bindAddr': 'Http Server Address',
  'install.httpServer.tips.bindAddr':
    'Console access address, eg: "0.0.0.0:9090"',

  'install.database.type': 'Database Type',
  'install.database.type.mysql': 'Mysql',
  'install.database.type.redis': 'Redis',
  'install.database.address': 'Database Connection Address',
  'install.database.tips.address': 'Database connection address, eg: ',
  'install.redis.address': 'Redis Connection Address',
  'install.redis.tips.address': 'redis connection address, eg: ',

  'install.admin.username': 'Administrator',
  'install.admin.password': 'Password',
  'install.cometSecret': 'Comet Secret',
  'install.cometSecret.tips':
    'Comet key, used for Comet communication authentication',

  'install.success.title': 'Installation Successful',
  'install.success.subTitle': 'Form submission successful!',
  'install.button.again': 'Create Again',
  'install.button.view': 'View Details',
  'install.button.login': 'Login',
  'install.description.title': 'Installation Instructions',
  'install.description.text':
    'After installation, the system will generate a configuration file . If this installation file system exists, it is considered that the installation is complete, and it will redirect to the login page on the next access.' +
    'If you want to reinstall, you can directly delete this configuration file. You can also set the --config parameter during startup to specify a new path for generating this configuration file.',
};

const localeTeam = {
  'menu.user.team': 'Team Manager',
  'team.name': 'Team',
  'team.select.placeholder': 'Select Team',
  'team.modal.addTitle': 'Create Team',
  'team.modal.editTitle': 'Edit Team',
  'team.modal.teamName': 'Team Name',
  'team.modal.teamInfo': 'Team Info',
  'team.add.user': 'add user',
  'team.member.username': 'username',
  'team.member.createdTime': 'create time',
  'team.member.isAdmin': 'type',
};

export default {
  'app.name': 'Jiascheduler Scheduling Platform',

  'menu.dashboard': 'Dashboard',
  'menu.assets': 'My Assets',
  'menu.assets.server': 'Server',
  'menu.server.dashboard': 'Server Dashboard',
  'menu.server.workplace': 'Server Workplace',
  'menu.server.monitor': 'Server Real-time Monitoring',
  'menu.list': 'List Page',
  'menu.repository': 'My Repository',
  'menu.runStatus': 'Run Status',
  'menu.manage': 'Manage',
  'menu.result': 'Result Page',
  'menu.exception': 'Exception Page',
  'menu.form': 'Form Page',
  'menu.profile': 'Profile Page',
  'menu.visualization': 'Data Visualization',
  'menu.user': 'User Center',
  'menu.apiDoc': 'API Documentation',
  'menu.faq': 'FAQ',
  'menu.terminal': 'Terminal',
  'navbar.docs': 'Documentation Center',
  'navbar.action.locale': 'Switch to English',

  'columns.index': '#',
  'columns.sn': 'Sequence Number',
  'columns.name': 'Name',
  // size
  'columns.size.mini': 'Mini',
  'columns.size.small': 'Small',
  'columns.size.medium': 'Medium',
  'columns.size.large': 'Large',
  // actions
  'columns.actions.refresh': 'Refresh',
  'columns.actions.density': 'Density',
  'columns.actions.columnSetting': 'Column Settings',

  'columns.createdTime': 'Creation Time',
  'columns.updatedTime': 'Update Time',
  'columns.createdUser': 'Creator',
  'columns.updatedUser': 'Updater',

  'form.selectAll': 'Select All',
  'form.search': 'Search',
  'form.reset': 'Reset',
  'form.save': 'Save',
  'form.add': 'Add',
  'form.submit.success': 'Submission Successful',

  'operations': 'Operations',
  'operations.create': 'Create',
  'operations.view': 'View',
  'operations.dispatch': 'Dispatch',
  'operations.download': 'Download',
  'operations.websshLogin': 'Login',
  'operations.quickStart': 'Quick Start',
  'operations.start': 'Start',
  'operations.stop': 'Stop',
  'operations.startTimer': 'Start Timer',
  'operations.stopTimer': 'Stop Timer',
  'operations.startSupervising': 'Start Supervising',
  'operations.stopSupervising': 'Stop Supervising',
  'operations.update': 'Update',
  'operations.granted': 'Grant',
  'operations.delete': 'Delete',
  'operations.delete.confirm': 'Are you sure you want to delete this data?',
  'operations.set': 'Set',
  'operations.next': 'Next',

  ...localeJob,
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
};
