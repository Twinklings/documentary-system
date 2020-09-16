import React, { PureComponent  } from 'react';
import { connect } from 'dva';
import {
  Button,
  Form,
  Table,
} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import { getList } from '../../../../services/newServices/logistics';


@connect(({ globalParameters }) => ({
  globalParameters,
}))
@Form.create()
class AuthorityList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data:{},
      loading:false,
      params:{
        size:10,
        current:1
      },
      selectedRowKey:['21']
    };
  }
  // ============ 初始化数据 ===============

  componentWillMount() {
    const { LogisticsConfigList } = this.props;
    this.getDataList()
    console.log("!##$345")
  }

  getDataList = () => {
    const {params} = this.state;
    this.setState({
      loading:true
    })
    getList(params).then(res=>{
      this.setState({
        loading:false
      })
      this.setState({
        data:{
          list:res.data.records,
          pagination:{
            current: res.data.current,
            pageSize: res.data.size,
            total: res.data.total
          }
        }
      })
    })
  }


  render() {
    const {
      form,
    } = this.props;

    const {data,selectedRowKey,loading} = this.state;


    const columns = [
      {
        title: '授权ID',
        dataIndex: 'partnerId',
        width: 200,
      },
      {
        title: '授权key',
        dataIndex: 'partnerKey',
        width: 250,
      },
      {
        title: '快递员名称',
        dataIndex: 'checkMan',
        width: 250,
      },
      {
        title: '当地网点名称',
        dataIndex: 'net',
        width: 350,
      },
    ];
    const rowSelection = {
      type: "radio",
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRowKeys);
      },
      getCheckboxProps: (record) => ({
        defaultChecked:selectedRowKey.includes(`${record.id}`)
      }),
    };
    return (
      <div>
        <Table rowSelection={rowSelection} loading={loading} rowKey={(record, index) => `${index}`} dataSource={data.list} columns={columns} />
      </div>

    );
  }
}
export default AuthorityList;