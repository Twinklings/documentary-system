import React, { PureComponent } from 'react';
import { Form, Input, Card, Row, Col, Button, Radio, TreeSelect, Select, DatePicker, message } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import func from '../../../utils/Func';

import { getAddList } from '../../../services/newServices/logistics';
import router from 'umi/router';
import { STATUS,TEMPID ,EXPRESS100DATA ,tempids} from './data.js';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@Form.create()
class LogisticsAdd extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      data:{

      },
    };
  }

  componentWillMount() {

  }

  // ============ 提交 ===============

  handleSubmit = e => {
    e.preventDefault();
    const {  form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          ...values,
          deptId:"1123598813738675201",
          // createTime: values.createTime.format('YYYY-MM-DD hh:mm:ss'),
        };
        console.log(params)
        // getAddList(params).then(res=>{
        //   message.success('提交成功');
        //   router.push('/logistics/authority');
        // })
      }
    });
  };

  onChange = value => {
    console.log(value)
    const ts = tempids()

    let text = ""
    for(let i=0; i< EXPRESS100DATA.length; i++){
      if(value === EXPRESS100DATA[i].num){
        text = EXPRESS100DATA[i].name
      }
    }
    for(let j=0; j< TEMPID.length; j++){
      if(text === TEMPID[j].value){
        text = TEMPID[j].value
      }
    }

    for(let key in ts){
      if(text === ts[key]){
        console.log(key)
      }
    }
    this.setState({
      data:{
        tempids:text
      }
    });
    console.log(this.state)

  };


  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
    };


    const action = (
      <Button type="primary" onClick={this.handleSubmit}>
        提交
      </Button>
    );

    return (
      <Panel title="新增" back="/logistics/authority" action={action}>
        <Form style={{ marginTop: 8 }}>
          <Card title="基本信息" className={styles.card} bordered={false}>
            <Row gutter={24}>
              <Col span={10}>
                <FormItem {...formItemLayout} label="快递公司编码：">
                  {getFieldDecorator('kuaidicom', {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                  })(
                    <Select placeholder="" onSelect={value => this.onChange(value)}>
                      {EXPRESS100DATA.map((item,index)=>{
                        return (<Option key={index} value={item.num}>{item.name}</Option>)
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="打印设备码:">
                  {getFieldDecorator('siid')(<Input placeholder="打印设备码" />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={10}>
                <FormItem {...formItemLayout} label="模板ID：">
                  {getFieldDecorator('tempid', {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                  })(
                    <Select placeholder="" disabled>
                      {TEMPID.map((item,index) =>{
                        return (<Option key={index} value={item.id}>{item.value}</Option>)
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="默认开关：">
                  {getFieldDecorator('status')(
                    <Radio.Group>
                      {STATUS.map(item=>{
                        return (
                          <Radio key={item.key} value={item.key}>{item.name}</Radio>
                        )
                      })}
                    </Radio.Group>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={10}>
                <FormItem {...formItemLayout} label="宽：">
                  {getFieldDecorator('width', {
                    rules: [
                      {
                        required: true,
                        message: '宽',
                      },
                    ],
                  })(<Input placeholder="宽" />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem {...formItemLayout} label="高：">
                  {getFieldDecorator('height', {
                    rules: [
                      {
                        required: true,
                        message: '高',
                      },
                    ],
                  })(<Input placeholder="高" />)}
                </FormItem>
              </Col>
            </Row>

          </Card>
        </Form>
      </Panel>
    );
  }
}

export default LogisticsAdd;
