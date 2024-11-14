/* eslint-disable prefer-const */
import React from 'react';
import {
  Button,
  Form,
  Input,
  notification,
  Space,
  TimePicker,
} from 'antd';
import {
  getConfigs,
  setConfigs,
} from '../../services/storageService';
import configDefaults from '../../constants/configDefaults';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const layout = {
  labelCol: { span: 16 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 0, span: 16 },
};
function ConfigEvents() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    setConfigs(values);
    notification.success({
      message: 'Configurações salvas!',
    });
  };

  let { timeOffset, defaultNotificationTime } =
    getConfigs(configDefaults);
  defaultNotificationTime = dayjs(defaultNotificationTime);
  return (
    <Form
      {...layout}
      layout="vertical"
      form={form}
      name="control-hooks"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
    >
      <Form.Item
        name="timeOffset"
        label="Compensação de tempo(em minutos) do dashboard:"
        initialValue={timeOffset}
        rules={[{ required: true }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item
        name="defaultNotificationTime"
        label="Tempo padrão para a primeira notificação:"
        initialValue={defaultNotificationTime}
      >
        <TimePicker
          format="mm:ss"
          secondStep={10}
          style={{ minWidth: 90 }}
        />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit">
            Salvar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
export default ConfigEvents;
