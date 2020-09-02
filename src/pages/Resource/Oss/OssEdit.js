import React, { PureComponent } from 'react';
import { Form, Input, Card, Button, Radio } from 'antd';
import { connect } from 'dva/index';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { OSS_DETAIL, OSS_INIT, OSS_SUBMIT } from '../../../actions/oss';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@connect(({ oss, loading }) => ({
  oss,
  submitting: loading.effects['oss/submit'],
}))
@Form.create()
class OssEdit extends PureComponent {
  state = {
    categoryValue: '1',
  };

  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(OSS_INIT());
    dispatch(OSS_DETAIL(id));
  }

  handleSubmit = e => {
    e.preventDefault();
    const {
      dispatch,
      match: {
        params: { id },
      },
      form,
    } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          id,
          ...values,
        };
        console.log(params);
        dispatch(OSS_SUBMIT(params));
      }
    });
  };

  onChange = e => {
    this.setState({
      categoryValue: e.target.value,
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      oss: { detail, init },
      submitting,
    } = this.props;

    const { category } = init;

    const { categoryValue } = this.state;

    let appIdDisplay = false;
    let regionDisplay = false;
    if (categoryValue === '4') {
      appIdDisplay = true;
      regionDisplay = true;
    }

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const action = (
      <Button type="primary" onClick={this.handleSubmit} loading={submitting}>
        提交
      </Button>
    );

    return (
      <Panel title="修改" back="/resource/oss" action={action}>
        <Form style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="所属分类">
              {getFieldDecorator('category', {
                rules: [
                  {
                    required: true,
                    message: '请选择所属分类',
                  },
                ],
                initialValue: String(detail.category),
              })(
                <RadioGroup name="category">
                  {category.map(d => (
                    <Radio key={d.dictKey} value={d.dictKey} onChange={this.onChange}>
                      {d.dictValue}
                    </Radio>
                  ))}
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="资源编号">
              {getFieldDecorator('ossCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入资源编号',
                  },
                ],
                initialValue: detail.ossCode,
              })(<Input placeholder="请输入资源编号" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="资源地址">
              {getFieldDecorator('endpoint', {
                rules: [
                  {
                    required: true,
                    message: '请输入资源地址',
                  },
                ],
                initialValue: detail.endpoint,
              })(<Input placeholder="请输入资源地址" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="空间名">
              {getFieldDecorator('bucketName', {
                rules: [
                  {
                    required: true,
                    message: '请输入空间名',
                  },
                ],
                initialValue: detail.bucketName,
              })(<Input placeholder="请输入空间名" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="accessKey">
              {getFieldDecorator('accessKey', {
                rules: [
                  {
                    required: true,
                    message: '请输入accessKey',
                  },
                ],
                initialValue: detail.accessKey,
              })(<Input placeholder="请输入accessKey" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="secretKey">
              {getFieldDecorator('secretKey', {
                rules: [
                  {
                    required: true,
                    message: '请输入secretKey',
                  },
                ],
                initialValue: detail.secretKey,
              })(<Input placeholder="请输入secretKey" />)}
            </FormItem>
            {appIdDisplay ? (
              <FormItem {...formItemLayout} label="appId">
                {getFieldDecorator('appId', {
                  initialValue: detail.appId,
                })(<Input placeholder="请输入应用ID" />)}
              </FormItem>
            ) : null}
            {regionDisplay ? (
              <FormItem {...formItemLayout} label="region">
                {getFieldDecorator('region', {
                  initialValue: detail.region,
                })(<Input placeholder="地域简称" />)}
              </FormItem>
            ) : null}
            <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                initialValue: detail.remark,
              })(<Input placeholder="请输入备注" />)}
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}

export default OssEdit;
