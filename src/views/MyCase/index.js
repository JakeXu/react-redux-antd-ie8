import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Table, Pagination, Popconfirm, Row, Col } from 'antd';

import TopSearch from './TopSearch';
// TODO 未使用
// import ConfirmFinisModal from './ConfirmFinisModal';
// import CloseModal from './CloseModal';

import * as myCaseAction from '../../store/modules/myCase/my_case_action';
import { getCaseMenu } from '../../store/modules/menu/menu_action';

import './index.less';
import * as Util from '../../util';
import { expandedRowRender, myCaseTableHead } from '../../util/templateUtil';

class MyCase extends React.Component {
  constructor(props) {
    super(props)
    this.closeCase = this.closeCase.bind(this);
    this.confirmFinishCase = this.confirmFinishCase.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.paginationChange = this.paginationChange.bind(this);
  }

  /**
   * 初始化table数据
   * 
   * desc：
   * 1、初始化《我的发布》列表数据
   * 2、获取侧边菜单统计数据
   * 3、初始化表格类型筛选列表
   * 
   */
  componentDidMount() {
    // 按上次操作状态查询
    this.props.myCaseAction.getCaseList(this.props.reqParams);
    // 获取侧边菜单
    this.props.getCaseMenu({ taskMatch: this.props.taskMatch });
    // 获取表格类型筛选列表
    this.props.myCaseAction.getCaseTypeList();
  }

  /**
   * 关闭case
   * 
   * 通过 `case_id` 关闭case
   * 当 `关闭case` 操作成功时， 通过 `reqParams` 获取最新数据
   * 
   */
  closeCase(case_id) {
    const { reqParams } = this.props;
    this.props.myCaseAction.updStatusClose(case_id, reqParams);
  }

  /**
   * 确认完成case
   * 
   * 通过 `case_id` 确认完成case
   * 当 `确认完成case` 操作成功时， 通过 `reqParams` 获取最新数据
   * 
   * 通过将该函数传递给 `closeModel` 组件，在组件内点击确认执行。
   * 并且会将关闭理由传入该行数内。
   * 
   */
  confirmFinishCase(case_id, close_message) {
    let { reqParams } = this.props;
    // reqParams.close_message = close_message; // TODO 关闭信息，通过确认框获取，命名是自定义的，等服务端确认请求参数后要做修改
    this.props.myCaseAction.updStatusConfirmFinish(case_id, reqParams);
  }

  /**
   * 分页搜索,根据分页Id查询相关页面
   * 
   * desc：
   * 获取 `state` 中存储的请求参数，在请求参数中加入当前页数信息，进行查询操作
   * 
   */
  paginationChange(pageId) {
    let { reqParams } = this.props;
    reqParams.pageId = pageId;
    this.props.myCaseAction.getCaseList(reqParams)
  }

  /**
   * 表格扩展搜索
   * 
   * desc：
   * 根据当前赛选条件，组合成服务端需要的请求参数，获取相应数据
   * 
   */
  handleTableChange(pagination, filters, sorter) {
    let { reqParams } = this.props;
    // 判断需要排序的列、正序/倒序
    reqParams.sortType = sorter.field || '';
    reqParams.isDesc = sorter.order == "ascend" ? 1 : 0;
    // 类型赛选字符拼接
    reqParams.taskType = filters.caseTypeName ? filters.caseTypeName.join(',') : '';
    reqParams.priority = filters.priority ? filters.priority.join(',') : '';

    // 搜索列表
    this.props.myCaseAction.getCaseList(reqParams);
  }

  render() {
    const { loading, caseList, pager, typeList } = this.props;
    // 表头配置与各个列的操作信息
    const caseTableHead = myCaseTableHead({
      confirmFinishCase: this.confirmFinishCase, // 详情操作的确认完成功能
      closeCase: this.closeCase, // 详情操作的关闭功能
      typeList: typeList // 类型搜索列表
    })
    // 表格参数
    const tableParams = {
      columns: caseTableHead,
      className: "table",
      dataSource: caseList,
      pagination: false,
      scroll: { x: 1600 },
      expandedRowRender: expandedRowRender, // 点击扩展详情 DOM
      size: "middle",
      loading: loading,
      onChange: this.handleTableChange
    }
    // 分页参数
    const pagerParams = {
      style: { marginTop: 16 },
      showQuickJumper: true,
      total: pager.total,
      showTotal: total => { return `共 ${total} 条` },
      current: pager.pageId,
      onChange: this.paginationChange,
      pageSize: pager.recPerPage
    }

    return (
      <div>
        <TopSearch/>
        <div className='table-group'>
          <Table
            { ...tableParams } />
        </div>

        <Pagination
          { ...pagerParams } />
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {
    caseList: state.myCase.caseList,
    typeList: state.myCase.typeList,
    loading: state.myCase.loading,
    reqParams: Util.myCaseParamsFromat(state),
    taskMatch: state.myCase.taskMatch,
    pager: state.myCase.pager,
    status: state.menu.status
  }
}

function mapDispatchToProps(dispatch) {
  return {
    myCaseAction: bindActionCreators(myCaseAction, dispatch),
    getCaseMenu: bindActionCreators(getCaseMenu, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyCase);
