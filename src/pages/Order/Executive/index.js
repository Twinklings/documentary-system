import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Button,
  Col,
  Form,
  Input,
  Badge,
  Row,
  Select,
  DatePicker,
  Divider,
  Dropdown,
  Menu,
  Icon,
  Modal,
  message,
  Tabs,
  Radio,
  Tag,
  Cascader,
  TreeSelect,
} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import { Resizable } from 'react-resizable';

import Panel from '../../../components/Panel';
import Grid from '../../../components/Sword/Grid';
import { ORDER_LIST } from '../../../actions/order';
import func from '../../../utils/Func';
import { setListData } from '../../../utils/publicMethod';
import { getQueryString1 } from '../../../utils/utils';
import { ORDERSTATUS, ORDERTYPPE, GENDER, ORDERTYPE, ORDERSOURCE, TIMETYPE, LOGISTICSCOMPANY, LOGISTICSSTATUS } from './data.js';
import {
  getPermissions,
  deleteData,
  localPrinting,
  logisticsRepeatPrint,
  updateReminds,
  toExamine,
  synCheck,
  syndata,
  subscription,
  updateData,
  productTreelist,
  batchLogisticsSubscription,
  getCurrenttree,
  getCurrentsalesman,
  updateConfirmTag
} from '../../../services/newServices/order';

// getList as getSalesmanLists,
import { getSalesmangroup } from '../../../services/newServices/sales';
import styles from './index.less';
import Export from '../components/export'
import TransferCustomers from './components/TransferCustomers'
import LogisticsConfig from './components/LogisticsConfig'
import PopupDetails from '../components/popupDetails'

import ImportData from '../components/ImportData';
import Excel from '../components/excel';
import Text from '../components/text';
import Journal from '../components/journal';
import SMS from '../components/smsList';
import VoiceList from '../components/voiceList';
import OrderImport from '../components/orderImport';
import SearchButton from '../components/button';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { TextArea } = Input;

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

let modal;

const ResizeableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

@connect(({ globalParameters }) => ({
  globalParameters,
}))
@Form.create()
class AllOrdersList extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      // 反选数据
      selectedRowKeys:[],
      selectedRowKey:[],
      salesmanList:[],
      data:{},
      loading:false,
      params:{
        size:10,
        current:1
      },
      tabKey:sessionStorage.executiveOrderTabKey ? sessionStorage.executiveOrderTabKey : '0',
      selectedRows:[],
      productList:[],
      // 导出
      exportVisible:false,
      // 转移客户
      TransferVisible:false,
      // 批量物流下单弹窗
      LogisticsConfigVisible:false,
      // 详情弹窗
      detailsVisible:false,
      // 日志弹窗
      journalVisible:false,
      journalList:{},
      // 短信弹窗
      SMSVisible:false,
      smsList:{},
      // 语音弹窗
      VoiceVisible:false,
      voice:{},
      // 免押宝导入弹窗
      noDepositVisible:false,
      confirmLoading: false,
      // SN激活导入弹窗
      excelVisible:false,
      // 文本导入弹窗
      textVisible:false,
      // 订单导入弹窗
      OrderImportVisible:false,
      // 首次打印提示弹框
      LogisticsAlertVisible:false,
      tips:[],
      salesmangroup:[],
      countSice:0,
      columns:[
        {
          title: '姓名',
          dataIndex: 'userName',
          width: 100,
        },
        {
          title: '手机号',
          dataIndex: 'userPhone',
          width: 120,
        },
        {
          title: '收货地址',
          dataIndex: 'userAddress',
          width: 200,
          ellipsis: true,
        },
        {
          title: '订单状态',
          dataIndex: 'confirmTag',
          width: 90,
          render: (key,row)=>{
            // 待审核、已激活、已取消、已退回-不可切换状态
            if(key == '0' || key == '7' || key == '8' || key == '9'){
              return (
                <div>
                  <Tag color={this.getORDERSCOLOR(key)}>
                    {this.getORDERSTATUS(key)}
                  </Tag>
                </div>
              )
            }else{
              return (
                <div style={{cursor: 'pointer'}}>
                  <Tag color={this.getORDERSCOLOR(key)}>
                    {this.getORDERSTATUS(key)}
                  </Tag>
                </div>
              )
            }
          }
        },
        {
          title: '订单状态(免押宝)',
          dataIndex: 'mianyaStatus',
          width: 130,
          render: (key,row)=>{
            let type=''
            if (key === 0) {
              type ='未授权';
            } else if(key === 1){
              type ='已授权';
            }else if(key === 2){
              type ='解冻';
            }else if(key === 3){
              type ='扣款';
            }
            return (
              type
            )
          }
        },
        {
          title: '机器状态(免押宝) ',
          dataIndex: 'machineStatus',
          width: 130,
          render: (key,row)=>{
            let type=''
            if (key === 0) {
              type ='未激活';
            } else if(key === 1){
              type ='已激活';
            }else if(key === 2){
              type ='已退回';
            }else if(key === 3){
              type ='被投诉';
            }
            return (
              type
            )
          }
        },
        {
          title: '产品分类',
          dataIndex: 'productType',
          width: 130,
        },
        {
          title: '产品型号',
          dataIndex: 'productName',
          width: 160,
        },
        {
          title: 'SN',
          dataIndex: 'productCoding',
          width: 200,
          ellipsis: true,
        },
        {
          title: '订单金额',
          dataIndex: 'payAmount',
          width: 150,
        },
        
        {
          title: '订单类型',
          dataIndex: 'orderType',
          width: 100,
          render: (key)=>{
            return (
              <div>{this.getORDERTYPE(key)} </div>
            )
          }
        },
        {
          title: '订单来源',
          dataIndex: 'orderSource',
          width: 100,
          render: (key)=>{
            return (
              <div>{this.getORDERSOURCE(key)} </div>
            )
          }
        },
        {
          title: '销售',
          dataIndex: 'salesman',
          width: 100,
        },
        {
          title: '快递公司',
          dataIndex: 'logisticsCompany',
          width: 130,
        },
        {
          title: '快递单号',
          dataIndex: 'logisticsNumber',
          width: 150,
        },
        {
          title: '物流状态',
          dataIndex: 'logisticsStatus',
          width: 100,
          render: (key)=>{
            return (
              <div>{this.getLogisticsStatusValue(key)} </div>
            )
          }
        },
        {
          title: '下单时间',
          dataIndex: 'createTime',
          width: 170,
        },
        {
          title: '操作',
          key: 'operation',
          fixed: 'right',
          width: 250,
          render: (text,row) => {
              return(
                  <div>
                    <a onClick={()=>this.handleDetails(row)}>详情</a>
                    <Divider type="vertical" />
                    {
                      row.logisticsCompany && row.logisticsNumber && !row.logisticsStatus ? (<><a onClick={()=>this.logisticsSubscribe(row)}>订阅</a><Divider type="vertical" /></>):''
                    }
                    <a onClick={()=>this.handleJournal(row)}>日志</a>
                    <Divider type="vertical" />
                    <a onClick={()=>this.handleSMS(row)}>短信</a>
                    <Divider type="vertical" />
                    <a onClick={()=>this.handleVoice(row)}>语音</a>

                    {/*<a onClick={()=>this.handleDelect(row)}>删除</a>*/}

                      {/* <a>跟进</a>
                      <Divider type="vertical" />
                      <a onClick={()=>this.handleEdit(row)}>编辑</a>
                      <Divider type="vertical" />
                      <a>置顶</a>
                      <Divider type="vertical" />
                      <a>归档</a>
                      <Divider type="vertical" /> */}

                      {/* <Divider type="vertical" /> */}
                      {/* <a onClick={()=>this.handleShowLogistics([row])}>发货</a> */}
                      {/* <Divider type="vertical" />
                      <a >短信</a> */}
                      {/* <Divider type="vertical" /> */}
                      {/* <a onClick={()=>this.handleReminds([row])}>提醒</a> */}
                  </div>
              )
          },
        },
      ],
      updateConfirmTagVisible:false,
      currentList:{},
      confirmTagList:{},
      _listArr:[],
      organizationTree:[]
    };
  }

  // ============ 初始化数据 ===============
  componentWillMount() {

    this.getTreeList();
    this.currenttree();

  }

  getTreeList = () => {
    productTreelist().then(res=>{
      this.setState({productList:res.data})
    })
  }
  // 组织列表
  currenttree = () => {
    getCurrenttree().then(res=>{
      this.setState({
        organizationTree:res.data
      })
    })
  }
  getDataList = () => {
    const {params} = this.state;
    this.setState({
      loading:true,
    })
    getPermissions(params).then(res=>{
      this.setState({
        countSice:res.data.total,
        data:setListData(res.data),
        loading:false,
        selectedRowKeys:[]
      })
    })
  }
  // 根据组织获取对应的业务员数据
  getSalesmanList = (value = "all_all") => {
    getCurrentsalesman(value).then(res=>{
      if(res.code === 200){
        res.data.unshift('全部');
        this.setState({
          salesmanList:res.data
        })
      }
    })
  }
  // 选择组织
  changeGroup = (value) => {
    if(value){
      this.getSalesmanList(value);
      this.setState({
        salesmanList:[]
      })
      this.props.form.setFieldsValue({
        salesman: `全部`
      });
    }
  }
  // ============ 查询 ===============
  handleSearch = params => {
    console.log(params,"查询参数")
    const { dateRange } = params;
    const { tabKey, salesmanList } = this.state;
    let payload = {
      ...params,
    };
    if (dateRange) {
      payload = {
        ...params,
        startTime: dateRange ? func.format(dateRange[0], dateFormat) : null,
        endTime: dateRange ? func.format(dateRange[1], dateFormat) : null,
      };
      // payload.dateRange = null;
    }
    if(payload.organizationId && payload.organizationId === ""){
      payload.organizationId = null;
    }
    if(payload.logisticsStatus && payload.logisticsStatus === "全部"){
      payload.logisticsStatus = null;
    }
    if(payload.orderSource && payload.orderSource === "全部"){
      payload.orderSource = null;
    }
    let text = "";
    if(payload.salesman === "全部" || payload.salesman === ""){
      for(let i=0; i<salesmanList.length; i++){
        text +=salesmanList[i]+","
      }
      payload.salesman = text.replace(/^,+/,"").replace(/,+$/,"").substr(3);
    }else{
      payload.salesman = payload.salesman
    }

    payload = {
      ...payload,
      confirmTag:tabKey === 'null' ? null : tabKey
    };

    payload.payPanyId = payload.productType ? payload.productType[0] : payload.payPanyId ? payload.payPanyId : null;
    payload.productTypeId = payload.productType ? payload.productType[1] : payload.productTypeId ? payload.productTypeId  : null;
    payload.productId = payload.productType ? payload.productType[2] : payload.productId ? payload.productId  : null;

    delete payload.dateRange;
    delete payload.productType;

    for(let key in payload){
      payload[key] = payload[key] === "" ? null : payload[key]
    }
    this.setState({
      params:payload
    },()=>{
      this.getDataList();
    })
  };
  // ============ 查询表单 ===============
  renderSearchForm = onReset => {
    const {
      form,
    } = this.props;
    const { getFieldDecorator } = form;

    const { salesmanList, salesmangroup, params, productList,organizationTree } = this.state;

    return (
      <div className={"default_search_form"}>
        <Form.Item label="姓名">
          {getFieldDecorator('userName',{
          })(<Input placeholder="请输入姓名" />)}
        </Form.Item>
        <Form.Item label="手机号">
          {getFieldDecorator('userPhone',{
          })(<Input placeholder="请输入手机号" />)}
        </Form.Item>
        <Form.Item label="SN">
              {getFieldDecorator('productCoding',{
          })(<Input placeholder="请输入SN" />)}
            </Form.Item>
        <Form.Item label="订单类型">
          {getFieldDecorator('orderType', {
            })(
            <Select placeholder={"请选择订单类型"} style={{ width: 120 }}>
              {ORDERTYPPE.map(item=>{
                return (<Option value={item.key}>{item.name}</Option>)
              })}
            </Select>
          )}
        </Form.Item>
        {/*<Form.Item label="组织">*/}
          {/*{getFieldDecorator('groupId', {*/}
              {/*})(*/}
              {/*<Select*/}
                {/*placeholder={"请选择分组"}*/}
                {/*style={{ width: 120 }}*/}
                {/*onChange={this.changeGroup}*/}
              {/*>*/}
                {/*{salesmangroup.map((item,key)=>{*/}
                  {/*return (<Option value={key}>{item}</Option>)*/}
                {/*})}*/}
              {/*</Select>*/}
            {/*)}*/}
        {/*</Form.Item>*/}
        <Form.Item label="所属组织">
          {getFieldDecorator('organizationId', {
          })(
            <TreeSelect
              style={{ width: 200 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              onChange={this.changeGroup}
              treeData={organizationTree}
              allowClear
              showSearch
              treeNodeFilterProp="title"
              placeholder="请选择所属组织"
            />
          )}
        </Form.Item>
        <Form.Item label="销售">
          {getFieldDecorator('salesman', {
              })(
              <Select placeholder={"请选择销售"} style={{ width: 120 }}>
                {salesmanList.map((item,index)=>{
                  return (<Option key={index} value={item}>{item}</Option>)
                })}
              </Select>
            )}
        </Form.Item>
        <Form.Item label="订单来源">
          {getFieldDecorator('orderSource', {
          })(
            <Select placeholder={"请选择订单来源"} style={{ width: 120 }}>
              {ORDERSOURCE.map(item=>{
                return (<Option value={item.key}>{item.name}</Option>)
              })}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="物流状态">
          {getFieldDecorator('logisticsStatus', {
            initialValue: params.logisticsStatus ? params.logsticsStatus : "全部",
          })(
            <Select placeholder={"请选择物流状态"} style={{ width: 120 }}>
              {LOGISTICSSTATUS.map(item=>{
                return (<Option value={item.key}>{item.name}</Option>)
              })}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="产品分类">
          {getFieldDecorator('productType', {
            })(
              <Cascader
                style={{ width: 260 }}
                options={productList}
                fieldNames={{ label: 'value',value: "id"}}
                changeOnSelect={true}
              ></Cascader>
          )}
        </Form.Item>
          <div>
            <Form.Item label="下单时间">
              {getFieldDecorator('dateRange', {
              })(
                <RangePicker showTime size={"default"} />
              )}
            </Form.Item>


            <div style={{ float: 'right' }}>
              <Button type="primary" htmlType="submit">
                <FormattedMessage id="button.search.name" />
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={()=>{
                // this.getSalesman();
                onReset()
              }}>
                <FormattedMessage id="button.reset.name" />
              </Button>
            </div>
          </div>
      </div>
    );
  };
  // ====== 首次打印提示弹框 ======
  handleLogisticsAlert =() =>{
    this.setState({
      LogisticsAlertVisible:false
    })
  }
  // =========首次打印===========
  first = () => {
    const {selectedRows} = this.state;
    const { dispatch } = this.props;
    const  tips=[];
    
    if(selectedRows.length <= 0){
      return  message.info('请至少选择一条数据');
    }

    if(selectedRows.length > 20){
      message.info('最多批量操作20条数据');
    }else{
      for(let i=0; i<selectedRows.length; i++){
        const item={}
        if(selectedRows[i].taskId){
          item.name="客户"+selectedRows[i].userName+"订单已打印过!只能进行重复打印!"
          tips.push(item);
        }
      }
      if(tips.length > 0 ){
        this.setState({
          tips:tips,
          LogisticsFirst:0,
          LogisticsAlertVisible:true
        })
        return false;
      }
      dispatch({
        type: `globalParameters/setDetailData`,
        payload: selectedRows,
      });
      this.setState({
        LogisticsConfigVisible:true
      })
    }

  }
  // =========重复打印=============
  repeat = () =>{
    const {selectedRows} = this.state;
    const { dispatch } = this.props;
    const  tips=[];
    const  tips1=[]
    // 当前时间戳
    const timestamp = (new Date()).getTime();
    const timeInterval = 24 * 60 * 60 * 1000 * 2;

    if(selectedRows.length <= 0){
      return  message.info('请至少选择一条数据');
    }

    if(selectedRows[0].logisticsPrintType === "1" || selectedRows[0].logisticsPrintType === "2"){
      if(selectedRows.length > 1){
       return  message.info('您已开启本地打印，一次最多打印一条数据');
      }
    }

    if(selectedRows.length > 20){
      message.info('最多批量操作20条数据');
    }else{
      for(let i=0; i<selectedRows.length; i++){
        const time = timestamp - (new Date(selectedRows[i].taskCreateTime)).getTime();
        if(!selectedRows[i].taskId || selectedRows[i].logisticsPrintType === "0"){
          const item1={};
          item1.name=selectedRows[i].userName+"客户没有首次打印记录,不能进行重复打印!";
          tips.push(item1)
        }else if( time > timeInterval){
          const item2={};
          item2.name=selectedRows[i].userName+"客户的订单 距离首次时间超过2天 禁止打印！";
          tips.push(item2)
        }
      }
      if(tips.length > 0 ){
        this.setState({
          tips:tips,
          LogisticsFirst:1,
          LogisticsAlertVisible:true
        })
        return false;
      }
      let param = [];
      for(let i=0; i<selectedRows.length; i++){
        param.push(selectedRows[i].taskId)
      }

      if(selectedRows[0].logisticsPrintType === "1" || selectedRows[0].logisticsPrintType === "2"){
          // 本地打印
          localPrinting({
            id:selectedRows[0].id,
            logisticsPrintType:selectedRows[0].logisticsPrintType
          }).then(res=>{
            if(res.code === 200){
              sessionStorage.setItem('imgBase64', res.data)
              window.open(`#/order/allOrders/img`);
            }else{
              message.error(res.msg);
            }
          })
      }else{
        logisticsRepeatPrint(param).then(res=>{
          if(res.code === 200){
            message.success(res.msg);
          }
        })
      }
    }
  }
  // 对错误订单的状态进行变更操作
  changeUpdateConfirmTag = (row) => {
    this.setState({
      updateConfirmTagVisible:true,
      confirmTagList:row
    })
  }
  handleCancelUpdateConfirmTag = () => {
    this.setState({
      updateConfirmTagVisible:false,
      radioChecked:''
    })
  }
  onChangeRadio = (e) => {
    this.setState({
      radioChecked: e.target.value
    })
  }

  handleSubmitUpdateConfirmTag = (e) => {
    const { radioChecked, confirmTagList } = this.state;
    console.log(confirmTagList)
    if(!radioChecked){
      return message.error("请选择需要更改的状态");
    }

    Modal.confirm({
      title: '提醒',
      content: "此次操作无法再次变更,确认操作!",
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      keyboard:false,
      onOk:() => {
        return new Promise((resolve, reject) => {
          updateConfirmTag({
            id:confirmTagList[0].id,
            confirmTag:radioChecked
          }).then(res=>{
            if(res.code === 200){
              message.success(res.msg);
              this.setState({
                updateConfirmTagVisible:false
              });
              this.getDataList();
              resolve();
            }else{
              message.error(res.msg);
              reject();
            }
          })

        }).catch(() => console.log('Oops errors!'));

      },
      onCancel() {},
    });


  }
  // =========关闭物流弹窗========
  handleCancelLogisticsConfig = () => {
    this.setState({
      LogisticsConfigVisible:false
    })
  }
  // 批量审核
  batchAudit = () => {
    const {selectedRows,tabKey} = this.state;

    const toExamines = this.toExamines;
    if(selectedRows.length <= 0){
      return message.info('请至少选择一条数据');
    }

    let type = false, _data = [];
    selectedRows.map(item=>{
      if(item.confirmTag === '0' || item.confirmTag === '1'){
        _data.push(item.id)
      }else{
        type = true;
      }
    })
    if(!_data || _data.length === 0){
      // modal.destroy();
      return message.error("您选择的数据中未包含未审核的数据");
    }

    if(tabKey === "0"){
      // 待审核
      modal = Modal.confirm({
        title: '提醒',
        // content: "确定审核此订单吗？",
        okText: '初审',
        cancelText: '终审',
        cancelButtonProps: {
          type:"primary"
        },
        keyboard:false,
        content:<div>
          确定审核此订单吗？
          <Button key="submit" type="danger" style={{ position: 'absolute',right: '177px',bottom: '24px'}} onClick={()=>{toExamines('9');}} >拒绝</Button>
          <Button key="submit" style={{ position: 'absolute',right: '250px',bottom: '24px'}} onClick={()=>{modal.destroy()}} >取消</Button>
          </div>,
        onOk() {
          toExamines('1');
        },
        onCancel() {
          toExamines('2');
        },
      });
    }else if(tabKey === "1"){
      // 一审
      modal = Modal.confirm({
        title: '提醒',
        // content: "确定审核此订单吗？",
        okText: '终审',
        cancelText: '拒绝',
        cancelButtonProps: {
          type:"danger"
        },
        content:<div>
          确定审核此订单吗？
          <Button key="submit" style={{ position: 'absolute',right: '177px',bottom: '24px'}} onClick={()=>{modal.destroy()}} >取消</Button>
          </div>,
        onOk() {
          // toExamines('1');
          toExamines('2');
        },
        onCancel() {
          toExamines('9');
        },
      });
    }

    
  }
  toExamines = (confirmTag) => {
    const {selectedRows} = this.state;
    let type = false, _data = [];
    const setAudit = this.setAudit;
    selectedRows.map(item=>{
      if(item.confirmTag === '0' || item.confirmTag === '1'){
        const list={}
        list.id=item.id;
        list.outOrderNo=item.outOrderNo;
        _data.push(list)
      }else{
        type = true;
      }
    })
    
    if(type){
      Modal.confirm({
        title: '提醒',
        content: "您选择的数据中包含已审核的数据，我们将不会对这些数据操作",
        okText: '确定',
        okType: 'info',
        cancelText: '取消',
        keyboard:false,
        onOk() {
          setAudit(_data,confirmTag)
        },
        onCancel() {
          setAudit(_data,confirmTag)
        },
      });
    }else{
      setAudit(_data,confirmTag)
    }
  }
  setAudit = (_data,confirmTag) => {
    toExamine({
      confirmTag,
      orderIdAndNo:_data
    }).then(res=>{
      if(res.code === 200){
        message.success(res.msg);
        this.getDataList();
        modal.destroy();
      }else {
        message.error(res.msg);
      }
    })
  }
  // 导出
  exportFile = () => {
    const {params}=this.state;
    const { dispatch } = this.props;
    let param = {
      ...params,
      startTime:params.startTime,
      endTime:params.endTime
    };
    dispatch({
      type: `globalParameters/setDetailData`,
      payload: param,
    });
    this.setState({
      exportVisible:true
    })
  }
  handleCancelExport = () =>{
    this.setState({
      exportVisible:false
    })
  }
  // 批量发货
  bulkDelivery = () => {
    const {selectedRows} = this.state;
    if(selectedRows.length <= 0){
      return message.info('请至少选择一条数据');
    }

    this.handleShowLogistics(selectedRows)
  }

  // 订单状态修改
  OrderModification = () => {
    debugger
    const {selectedRows} = this.state;
    if(selectedRows.length <= 0){
      return message.info('请至少选择一条数据');
    }
    if(selectedRows.length > 1){
      return message.info('只能选择一条数据');
    }
    if(selectedRows[0].confirmTag === "0" || selectedRows[0].confirmTag === "7" ||selectedRows[0].confirmTag === "8" || selectedRows[0].confirmTag === "9"){
      message.info('当前订单状态不适用变更操作');
    }else {
      this.changeConfirmTag(selectedRows)
    }
  }

  // 对错误订单状态进行修改
  bulkModification = () => {
    const {selectedRows} = this.state;
    if(selectedRows.length <= 0){
      return message.info('请至少选择一条数据');
    }
    if(selectedRows.length > 1){
      return message.info('只能选择一条数据');
    }
    if(selectedRows[0].confirmTag === "0" || selectedRows[0].confirmTag === "1" ){
      
      message.info('当前订单状态不适用变更操作');
    }else {
      this.changeUpdateConfirmTag(selectedRows);
    }
  }
  // 批量订阅
  bulkSubscription = () => {
    const {selectedRows,_listArr} = this.state;
    if(selectedRows.length <= 0){
      return message.info('请至少选择一条数据');
    }
    const listArr=[];
    if(_listArr.length > 0){
      for(let i=0; i<selectedRows.length; i++){
        const idSame=true;
        for(let j=0; j<_listArr.length; j++){
          if(selectedRows[i].id === _listArr[j].id){
            idSame=false;
          }
        }
        if(idSame){
          const item={};
          if(selectedRows[i].logisticsCompany && selectedRows[i].logisticsNumber && !selectedRows[i].logisticsStatus){
            item.confirmTag=selectedRows[i].confirmTag;
            item.deptId=selectedRows[i].deptId;
            item.id=selectedRows[i].id;
            item.logisticsCompany=selectedRows[i].logisticsCompany;
            item.logisticsNumber=selectedRows[i].logisticsNumber;
            item.logisticsType=selectedRows[i].logisticsType;
            item.outOrderNo=selectedRows[i].outOrderNo;
            item.productCoding=selectedRows[i].productCoding;
            item.productName=selectedRows[i].productName;
            item.shipmentRemind=true;
            item.tenantId=selectedRows[i].tenantId;
            item.userPhone=selectedRows[i].userPhone;
            listArr.push(item)
          }
        }
      }
    }else {
      for(let i=0; i<selectedRows.length; i++){
        const item={};
        if(selectedRows[i].logisticsCompany && selectedRows[i].logisticsNumber && !selectedRows[i].logisticsStatus){
          item.confirmTag=selectedRows[i].confirmTag;
          item.deptId=selectedRows[i].deptId;
          item.id=selectedRows[i].id;
          item.logisticsCompany=selectedRows[i].logisticsCompany;
          item.logisticsNumber=selectedRows[i].logisticsNumber;
          item.logisticsType=selectedRows[i].logisticsType;
          item.outOrderNo=selectedRows[i].outOrderNo;
          item.productCoding=selectedRows[i].productCoding;
          item.productName=selectedRows[i].productName;
          item.shipmentRemind=true;
          item.tenantId=selectedRows[i].tenantId;
          item.userPhone=selectedRows[i].userPhone;
          listArr.push(item)
        }
      }
    }
    this.setState({
      _listArr:listArr
    })
    console.log(listArr)
    const _this=this;
    Modal.confirm({
      title: '提示',
      content: '请确认订单号、物流名称无误后再进行物流订阅操作！此操作属于扣费行为不可逆转！',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      keyboard:false,
      async onOk() {
        if(listArr.length > 0){
          batchLogisticsSubscription(listArr).then(res=>{
            if(res.code === 200){
              message.success(res.msg);
              _this.getDataList()
            }else{
              message.error(res.msg);
            }
          })
        }
      },
      onCancel() {},
    });
  }


  btnButtonBack = (code) => {
    console.log(code,"codecodecode")
    if(code === "SN-import"){
      this.handleExcelImport()
    }else if(code === "text-import"){
      this.handleTextImport()
    }else if(code === "order-import"){
      this.handleOrderImport()
    }else if(code === "add"){
      router.push(`/order/executive/add`);
    }else if(code === "examine"){
      // 审核
      this.batchAudit()
    }else if(code === "synchronization"){
      // 免押同步
      this.importData()
    }else if(code === "deliver-goods"){
      // 发货
      this.bulkDelivery()
    }else if(code === "bell"){
      // 提醒
      this.batchReminders()
    }else if(code === "subscribe"){
      // 批量订阅
      this.bulkSubscription()
    }else if(code === "export"){
      // 导出
      this.exportFile()
    }

    else if(code === "transfer"){
      // 转移客户
      this.handleShowTransfer()
    }
    else if(code === "repeat-printing"){
      // 重复打印
      this.repeat()
    }
    else if(code === "first-printing"){
      // 首次打印
      this.first()
    }
    else if(code === "status-change"){
      // 状态变更
      this.bulkModification()
    }
    // else if(code === "status-modification"){
    //   // 状态修改
    //   this.OrderModification()
    // }

  }
  // 左侧操作按钮
  renderLeftButton = (tabKey) => {
    console.log(tabKey,"tabKey")
    return (<>
      <SearchButton
        btnButtonBack={this.btnButtonBack}
        tabKey={tabKey}
        code={"executive"}
      />
    </>)
  };

  // 删除
  handleDelect = (row) => {
    const refresh = this.refreshTable;
    Modal.confirm({
      title: '删除确认',
      content: '确定删除选中记录?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      keyboard:false,
      async onOk() {
        deleteData({
          ids:row.id
        }).then(res=>{
          message.success(res.msg);
          refresh();
        })
      },
      onCancel() {},
    });

  }

  // 提醒
  handleReminds = (data) => {
    Modal.confirm({
      title: '提醒',
      content: "确定提示此订单吗？",
      okText: '确定',
      okType: 'info',
      cancelText: '取消',
      keyboard:false,
      onOk() {
        let _data = data.map(item=>{
          return {
            deptId:item.deptId,
            id:item.id,
            outOrderNo:item.outOrderNo,
            payAmount:Number(item.payAmount),
            userPhone:item.userPhone,
            userName:item.userName,
          }
        })
        updateReminds(_data).then(res=>{
          if(res.code === 200){
            message.success(res.msg);
          }else{
            message.error(res.msg);
          }
        })
      },
      onCancel() {},
    });
  }

  // 批量提醒
  batchReminders = () => {
    const {selectedRows} = this.state;
    if(selectedRows.length <= 0){
      return message.info('请至少选择一条数据');
    }
    this.handleReminds(selectedRows)
  }

  refreshTable = () => {
    this.getDataList();
  }

  // 导入数据
  importData = () => {
    // 检查是否设置同步账号
    synCheck().then(res=>{
      if(res.code === 200 && !res.data){
        // 成功打开面押宝同步弹窗  - false=没有同步，就开打弹窗进行同步验证
        this.setState({
          noDepositVisible:true
        })
      }else{
        // return message.error('当前系统已经绑定您指定的同步账号,请联系管理员进行排查!');
        const {confirmLoading} = this.state;
        
        Modal.confirm({
          title: '提醒',
          content: "当前系统已经绑定您指定的同步账号,确定同步数据吗？",
          okText: '确定',
          okType: 'primary',
          cancelText: '取消',
          keyboard:false,
          // confirmLoading:confirmLoading,
          onOk:() => {
            if(confirmLoading){
              return message.info("请勿连续操作，请等待");
            }
            this.setState({
              confirmLoading:true
            })
            return new Promise((resolve, reject) => {
              syndata().then(res=>{
                this.setState({
                  confirmLoading:false
                })
                if(res.code === 200){
                  message.success(res.msg);
                  resolve();
                }else{
                  message.error(res.msg);
                  reject();
                }
              })
            }).catch(() => console.log('Oops errors!'));
            
          },
          onCancel() {},
        });
      }
    })
  }

  handleCancelNoDeposit = () => {
    this.setState({
      noDepositVisible:false
    })
  }

  // 修改数据
  handleEdit = (row) => {
    const { dispatch } = this.props;
    dispatch({
      type: `globalParameters/setDetailData`,
      payload: row,
    });
    router.push(`/order/executive/edit/${row.id}`);
  }

  renderRightButton = () => (
    <>
      <Button icon="ordered-list">排序</Button>
      <Button icon="unordered-list">列表</Button>
    </>
  );

  // 物流订阅
  logisticsSubscribe =(row) =>{
    const list=this.getDataList;
    Modal.confirm({
      title: '提示',
      content: '请确认订单号、物流名称无误后再进行物流订阅操作！此操作属于扣费行为不可逆转！',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      keyboard:false,
      async onOk() {
        let type=''
        for(let key in LOGISTICSCOMPANY){
          if(LOGISTICSCOMPANY[key] === row.logisticsCompany){
            type = key
          }
        }
        const params={
          deptId:row.deptId,
          id:row.id,
          logisticsCompany:row.logisticsCompany,
          logisticsNumber:row.logisticsNumber,
          logisticsType: type,
          outOrderNo: row.outOrderNo,
          productCoding: row.productCoding,
          productName: row.productName,
          shipmentRemind: true,
          tenantId: row.tenantId,
          userPhone: row.userPhone,
          confirmTag: row.confirmTag,
        }
        subscription(params).then(res=>{
          if(res.code === 200){
            message.success(res.msg);
            list()
          }else{
            message.error(res.msg);
          }
        })
      },
      onCancel() {},
    });
  }

  getText = (key, type) => {
    let text = ""
    type.map(item=>{
      if(item.key === key){
        text = item.name
        return item.name
      }
    })

  }
  // 订单状态
  getORDERSTATUS = (key) => {
    let text = ""
    if(key === 0 || key === '0'){ text = "待审核" }
    if(key === 1 || key === '1'){ text = "已初审" }
    if(key === 2 || key === '2'){ text = "已终审" }
    if(key === 3 || key === '3'){ text = "已发货" }
    if(key === 4 || key === '4'){ text = "在途中" }
    if(key === 5 || key === '5'){ text = "已签收" }
    if(key === 6 || key === '6'){ text = "跟进中" }
    if(key === 7 || key === '7'){ text = "已激活" }
    if(key === 11 || key === '11'){ text = "退回中" }
    if(key === 8 || key === '8'){ text = "已退回" }
    if(key === 9 || key === '9'){ text = "已取消" }
    if(key === 10 || key === '10'){ text = "已过期" }
    return text;
  }
  // 订单状态颜色
  getORDERSCOLOR = (key) => {
    let text = ""
    if(key === 0 || key === '0'){ text = "#E6A23C" }
    if(key === 1 || key === '1'){ text = "#409EFF" }
    if(key === 2 || key === '2'){ text = "#409EFF" }
    if(key === 3 || key === '3'){ text = "#409EFF" }
    if(key === 4 || key === '4'){ text = "#409EFF" }
    if(key === 5 || key === '5'){ text = "#F56C6C" }
    if(key === 6 || key === '6'){ text = "#F56C6C" }
    if(key === 7 || key === '7'){ text = "#67C23A" }
    if(key === 11 || key === '11'){ text = "#909399" }
    if(key === 8 || key === '8'){ text = "#909399" }
    if(key === 9 || key === '9'){ text = "#909399" }
    if(key === 10 || key === '10'){ text = "#909399" }
    return text;
  }
  // 订单类型
  getORDERTYPE = (key) => {
    let text = ""
    if(key === 1 || key === '1'){
      text = "免费"
    }
    if(key === 2 || key === '2'){
      text = "到付"
    }
    if(key === 3 || key === '3'){
      text = "收费"
    }
    if(key === 4 || key === '4'){
      text = "免押"
    }
    if(key === 5 || key === '5'){
      text = "其他"
    }
    return text;
  }
  // 订单来源
  getORDERSOURCE = (key) => {
    let text = ""
    if(key === 1 || key === '1'){ text = "新增" }
    if(key === 2 || key === '2'){ text = "导入" }
    if(key === 3 || key === '3'){ text = "H5扫码" }
    if(key === 4 || key === '4'){ text = "销售" }
    if(key === 5 || key === '5'){ text = "电销" }
    if(key === 6 || key === '6'){ text = "网销" }
    if(key === 7 || key === '7'){ text = "地推" }
    if(key === 7 || key === '8'){ text = "免押宝" }
    return text;
  }

   // 获取物流状态
   getLogisticsStatusValue = (value) => {
    let text =
    value === '-1' ? "单号错误" :
    value === '0' ? "暂无轨迹":
    value === '1' ? "快递收件":
    value === '2' ? "在途中":
    value === '3' ? "已签收":
    value === '4' ? "问题件":
    value === '5' ? "疑难件":
    value === '6' ? "退件签收":
    value === '7' ? "快递揽件":"";
    return text;
  }


  statusChange = (key) => {
    sessionStorage.executiveOrderTabKey = key;
    let _params = {...this.state.params}
    _params.current = 1
    this.setState({
      tabKey:key,
      params:_params
    },()=>{
      this.handleSearch(this.state.params)
    })
  }

  onSelectRow = (rows,keys) => {
    this.setState({
      selectedRows: rows,
      selectedRowKeys: keys,
    });
  };

  // 打开详情弹窗
  handleDetails = (row) => {
    const { dispatch } = this.props;
    dispatch({
      type: `globalParameters/setDetailData`,
      payload: row,
    });
    this.setState({
      detailsVisible:true
    })
  }
  // 关闭详情弹窗
  handleCancelDetails = () => {
    this.setState({
      detailsVisible:false
    })
  }

  // 打开日志弹窗
  handleJournal = (row) => {
    this.setState({
      journalVisible:true,
      journalList:row
    })
  }
  // 关闭日志弹窗
  handleCancelJournal = () => {
    this.setState({
      journalVisible:false
    })
  }

  // 打开短信弹窗
  handleSMS = (row) => {
    this.setState({
      SMSVisible:true,
      smsList:row
    })
  }
  // 关闭短信弹窗
  handleCancelSMS = () => {
    this.setState({
      SMSVisible:false
    })
  }

  // 打开语音列表弹窗
  handleVoice = (row) => {
    this.setState({
      VoiceVisible:true,
      voice:row
    })
  }
  // 关闭语音列表弹窗
  handleCancelVoice = () => {
    this.setState({
      VoiceVisible:false
    })
  }


  // 打开物流弹窗
  handleShowLogistics = (data) => {
    const { dispatch } = this.props;

    dispatch({
      type: `globalParameters/setListId`,
      payload: data,
    });
    router.push('/order/allOrders/logisticsConfiguration');

  }

  // 打开转移客户弹窗
  handleShowTransfer = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if(selectedRows.length <= 0){
      return message.info('请至少选择一条数据');
    }

    dispatch({
      type: `globalParameters/setListId`,
      payload: selectedRows,
    });
    this.setState({
      TransferVisible:true
    })
  }
  // 转移客户
  handleCancelTransfer = (type) => {
    // getlist代表点击保存成功关闭弹窗后需要刷新列表
    if(type === "getlist"){
      this.getDataList();
    }
    this.setState({
      TransferVisible:false
    })
  }

  // 反选数据
  onChangeCheckbox = () => {
    const { selectedRowKeys, data } = this.state;

    let rowKeys = [];
    let row = []
    data.list.map(item=>{
      if(selectedRowKeys.indexOf(item.id) === -1){
        rowKeys.push(item.id)
        row.push(item)
      }
    })
    this.setState({
      selectedRowKeys:rowKeys,
      selectedRows:row
    })
  }

  handleResize = index => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return { columns: nextColumns };
    });
  };


  // SN激活导入弹窗
  handleExcelImport = () =>{
    this.setState({
      excelVisible: true,
    });
  }

  handleExcelCancel = () =>{
    this.setState({
      excelVisible: false,
    });
  }
  
  // 文本导入弹窗
  handleTextImport = () =>{
    this.setState({
      textVisible: true,
    });
  }

  handleTextCancel = () =>{
    this.setState({
      textVisible: false,
    });
  }
  // 订单导入弹窗
  handleOrderImport = () =>{
    this.setState({
      OrderImportVisible: true,
    });
  }

  handleOrderImportCancel = () =>{
    this.setState({
      OrderImportVisible: false,
    });
  }

  components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  render() {
    const code = 'allOrdersList';

    const {
      form,
    } = this.props;

    const formAllItemLayout = {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 20,
      },
    };

    const {
      data,
      loading,
      tabKey,
      exportVisible,
      TransferVisible,
      LogisticsConfigVisible,
      selectedRows,
      detailsVisible,
      journalVisible,
      SMSVisible,
      smsList,
      VoiceVisible,
      voice,
      journalList,
      selectedRowKeys,
      noDepositVisible,
      updateConfirmTagVisible,
      textVisible,
      currentList,
      excelVisible,
      OrderImportVisible,
      LogisticsFirst,
      LogisticsAlertVisible,
      tips,
      countSice,
      params
    } = this.state;

    const columns = this.state.columns.map((col, index) => ({
      ...col,
      onHeaderCell: column => ({
        width: column.width,
        onResize: this.handleResize(index),
      }),
    }));

    const TabPanes = () => (
      <div className={styles.tabs}>
        {ORDERSTATUS.map(item=>{
          return (
            <div
              onClick={()=>this.statusChange(item.key)}
              className={item.key === tabKey ? styles.status_item_select : styles.status_item}
            >{item.name}</div>
          )
        })}
      </div>
    );


    return (
      <Panel>
        <div className={styles.ordersTabs}>
          <Tabs type="card" defaultActiveKey={tabKey} onChange={this.statusChange} style={{height:59}}>
            {ORDERSTATUS.map(item=>{
              return (
                <TabPane tab={
                  <span>
                    {((
                      item.key === params.confirmTag || 
                      JSON.stringify(item.key) === params.confirmTag
                      ) && (
                        item.key === '0' ||
                        item.key === '1' ||
                        item.key === '2' ||
                        item.key === '3' ||
                        item.key === '4' ||
                        item.key === '5' ||
                        item.key === '6' ||
                        item.key === '7' ||
                        item.key === '8' ||
                        item.key === '9' ||
                        item.key === '10' ||
                        item.key === null
                      )) ? (
                    <Badge count={countSice} overflowCount={999}>
                        <a href="#" className="head-example" />
                      </Badge>) : ""
                    }
                    {item.name}
                  </span>
                } key={item.key}>
                </TabPane>
              )
            })}
          </Tabs>
        
          <Grid
            code={code}
            form={form}
            onSearch={this.handleSearch}
            onSelectRow={this.onSelectRow}
            renderSearchForm={this.renderSearchForm}
            loading={loading}
            data={data}
            columns={columns}
            scroll={{ x: 1000 }}
            renderLeftButton={()=>this.renderLeftButton(tabKey)}
            // renderRightButton={this.renderRightButton}
            counterElection={true}
            onChangeCheckbox={this.onChangeCheckbox}
            selectedKey={selectedRowKeys}
            tblProps={
              {components:this.components}
            }
            // multipleChoice={true}
          />
          {/* 详情 */}
          {detailsVisible?(
            <PopupDetails
              detailsVisible={detailsVisible}
              handleCancelDetails={this.handleCancelDetails}
            />
          ):""}
        </div>
        {/* 日志弹框 */}
        {journalVisible?(
          <Journal
            journalVisible={journalVisible}
            journalList={journalList}
            handleCancelJournal={this.handleCancelJournal}
          />
        ):""}
        {/* 短信弹框 */}
        {SMSVisible?(
          <SMS
            SMSVisible={SMSVisible}
            smsList={smsList}
            handleCancelSMS={this.handleCancelSMS}
          />
        ):""}
        {/* 语音列表弹框 */}
        {VoiceVisible?(
          <VoiceList
            VoiceVisible={VoiceVisible}
            voice={voice}
            handleCancelVoice={this.handleCancelVoice}
          />
        ):""}

        {/* 导出 */}
        {exportVisible?(
          <Export
            exportVisible={exportVisible}
            handleCancelExport={this.handleCancelExport}
          />
        ):""}

        {/* 设备 */}
        {TransferVisible?(
          <TransferCustomers
            TransferVisible={TransferVisible}
            handleCancelTransfer={this.handleCancelTransfer}
          />
        ):""}
        {/* 批量物流下单 */}
        {LogisticsConfigVisible?(
          <LogisticsConfig
            LogisticsConfigVisible={LogisticsConfigVisible}
            LogisticsConfigList={selectedRows}
            handleCancelLogisticsConfig={this.handleCancelLogisticsConfig}
          />
        ):""}

        {/* 免押宝导入弹窗 */}
        {noDepositVisible?(
          <ImportData
            noDepositVisible={noDepositVisible}
            handleCancelNoDeposit={this.handleCancelNoDeposit}
          />
        ):""}
        {/* SN激活导入弹窗 */}
        {excelVisible?(
          <Excel
            excelVisible={excelVisible}
            handleExcelCancel={this.handleExcelCancel}
          />
        ):""}

        {/* 文本导入弹窗 */}
        {textVisible?(
          <Text
            textVisible={textVisible}
            handleTextCancel={this.handleTextCancel}
          />
        ):""}
        {/* 订单导入弹窗 */}
        {OrderImportVisible?(
          <OrderImport
          OrderImportVisible={OrderImportVisible}
          handleOrderImportCancel={this.handleOrderImportCancel}
          />
        ):""}


        <Modal
          title="提示"
          visible={LogisticsAlertVisible}
          maskClosable={false}
          width={500}
          onCancel={this.handleLogisticsAlert}
          footer={[
            <Button key="back" onClick={this.handleLogisticsAlert}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={()=>this.handleLogisticsAlert()}>
              确定
            </Button>,
          ]}
        >
          <div>
            {tips.map(item=>{
              return(
              <p>{item.name}</p>
              )
            })}
          </div>
        </Modal>

        <Modal
          title="状态变更"
          visible={updateConfirmTagVisible}
          maskClosable={false}
          destroyOnClose
          width={560}
          onCancel={this.handleCancelUpdateConfirmTag}
          footer={[
            <Button key="back" onClick={this.handleCancelUpdateConfirmTag}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={()=>this.handleSubmitUpdateConfirmTag()}>
              确定
            </Button>,
          ]}
        >
          <Form>
            <FormItem {...formAllItemLayout} label="订单状态">
            {currentList.confirmTag === '2' ||
                  currentList.confirmTag === '3'||
                  currentList.confirmTag === '4'||
                  currentList.confirmTag === '5' ? (
                    <Radio.Group onChange={this.onChangeRadio}>
                      <Radio value={6}>跟进中</Radio>
                      <Radio value={7}>已激活</Radio>
                      <Radio value={8}>已退回</Radio>
                      <Radio value={9}>已取消</Radio>
                      <Radio value={11}>退回中</Radio>
                    </Radio.Group>
                  ) : (
                    <Radio.Group onChange={this.onChangeRadio}>
                       <Radio value={6}>跟进中</Radio>
                      <Radio value={7}>已激活</Radio>
                      <Radio value={8}>已退回</Radio>
                      <Radio value={9}>已取消</Radio>
                      <Radio value={11}>退回中</Radio>
                    </Radio.Group>
                  )}
            </FormItem>
            <FormItem {...formAllItemLayout} label="修改原因">
              <TextArea rows={2} disabled />
            </FormItem>
          </Form>
        </Modal>

      </Panel>
    );
  }
}
export default AllOrdersList;
