import React, { PureComponent } from 'react';
import {
  Modal,
  Form,
  Button, Card, Row, Col, Input, Cascader, Select, DatePicker, message,Radio
} from 'antd';
import { connect } from 'dva';
import styles from '@/layouts/Sword.less';
import { ORDERSOURCE, ORDERTYPE } from '@/pages/Order/OrderList/data';
import moment from 'moment';
import {
  returnOfGoodsCapacity,
  returnOfGoodsSave,
} from '../../../../services/newServices/order';

const FormItem = Form.Item;
const { TextArea } = Input;
@connect(({ globalParameters}) => ({
  globalParameters,
}))
@Form.create()
class ReturnOfGoodsForm extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      capacitys:[],
      payment:null
    };
  }

  componentWillMount() {
    this.getCapacityDataInfo();
  }

  getCapacityDataInfo =(v) =>{
    let {returnOfGoodsDataList} = this.props;
    let json = {
      orderId:returnOfGoodsDataList[0].id,
      productId:returnOfGoodsDataList[0].productId
    };
    if(v){
      json.sendManPrintAddr = v;
    }
    returnOfGoodsCapacity(json).then(res=>{
      if(res.code==200){
        this.setState({capacitys:res.data})
      }else{
        message.error(res.msg);
      }
    })
  }
  handleClick = ()=>{

  }

  handleSubmit = e => {
    const {
      handleCancel
    } = this.props;
    e.preventDefault();
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        ...values,
      };
      returnOfGoodsSave(params).then(resp => {
        if (resp.success) {
          message.success(resp.msg);
          form.resetFields();
          handleCancel();
        } else {
          message.error(resp.msg || '提交失败');
        }
      });
    });
  };

  validatePhone = (rule, value, callback) => {
    if (value && !(/^1[3456789]\d{9}$/.test(value))) {
      callback(new Error('请输入正确的手机号格式'));
    }else{
      callback();
    }
  }

  onChange = e => {
    this.setState({
      payment: e.target.value,
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      confirmLoading,
      handleCancel
    } = this.props;

    const {loading,capacitys,payment} = this.state;

    const formAllItemLayout = {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 18,
      },
    };

    return (
      <>
        <Modal
          title="退货"
          width={550}
          visible={visible}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
          maskClosable={false}
          loading={loading}
          footer={[
            <Button onClick={handleCancel}>
              取消
            </Button>,
            <Button type="primary" onClick={this.handleSubmit}>
              保存
            </Button>,
            <Button type="primary" onClick={handleCancel}>
              取消下单
            </Button>
          ]}
        >
          <Form style={{ marginTop: 8 }} onSubmit={this.handleSubmit}>

                  <FormItem {...formAllItemLayout} label="姓名">
                    {getFieldDecorator('recManName', {
                    })(<Input placeholder="请输入姓名" />)}
                  </FormItem>
                  <FormItem {...formAllItemLayout} label="手机号">
                    {getFieldDecorator('recManMobile', {
                      rules: [
                        { validator: this.validatePhone },
                      ],
                    })(<Input placeholder="请输入手机号" />)}
                  </FormItem>
                  <FormItem {...formAllItemLayout} label="寄件地址">
                    {getFieldDecorator('sendManPrintAddr', {
                    })(<Input placeholder="请输入寄件地址" onBlur={(e)=>this.getCapacityDataInfo(e.target.value)}/>)}
                  </FormItem>
                  <div style={{color:'#ccc',padding:'0px 0px 10px 60px'}}>用户退货地址不是收货地址,以上可以更改</div>
                  <FormItem {...formAllItemLayout} label="快递公司">
                    {getFieldDecorator('com', {
                      rules: [
                        {
                          required: true,
                          message: '请选择快递公司',
                        },
                      ],
                    })(
                      <Select placeholder={"请选择快递公司"}>
                        {capacitys.map(item=>{
                          if(payment == 'CONSIGNEE' && item.type == 2){
                          }else{
                            return (<Select.Option value={item.com}>{item.value}</Select.Option>)
                          }
                        })}
                      </Select>
                    )}
                  </FormItem>
                  {/*<FormItem {...formAllItemLayout} label="所在地区">*/}
                  {/*  {getFieldDecorator('region', {*/}
                  {/*  })(*/}
                  {/*    <Cascader*/}
                  {/*      options={CITY}*/}
                  {/*      onChange={this.onChange}*/}
                  {/*    />*/}
                  {/*  )}*/}
                  {/*</FormItem>*/}
                  <FormItem {...formAllItemLayout} label="付款方式">
                    {getFieldDecorator('payment', {
                      initialValue: 'SHIPPER',
                      rules: [
                        {
                          required: true,
                          message: '请选择付款方式',
                        },
                      ],
                    })(
                      <Radio.Group onChange={this.onChange}>
                        <Radio value='SHIPPER'>寄付</Radio>
                        <Radio value='CONSIGNEE'>到付</Radio>
                      </Radio.Group>
                    )}
                  </FormItem>

                  {/*<FormItem {...formAllItemLayout} label="退货原因">*/}
                  {/*  {getFieldDecorator('productType', {*/}
                  {/*    initialValue: null,*/}
                  {/*  })(*/}

                  {/*  )}*/}
                  {/*</FormItem>*/}

                  <FormItem {...formAllItemLayout} label="退货备注">
                    {getFieldDecorator('remark')(
                      <TextArea rows={4} />
                    )}
                  </FormItem>
          </Form>
        </Modal>

      </>
    );
  }
}

export default ReturnOfGoodsForm;
