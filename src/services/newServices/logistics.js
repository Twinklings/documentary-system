/**
 * Created by Lenovo on 2020/9/8.
 */
// import { stringify } from 'qs';
import request from '../../utils/request';
 import func from '../../utils/Func';


// ============ 授权配置 ===============
export async function getList(params) {
  return request('/api/logistics/authorization/list', {
    method: 'get',
    body: params,
  });
}

export async function getAddList(params) {
  return request('/api/logistics/authorization/save', {
    method: 'POST',
    body: params,
  });
}

export async function getSubmit(params) {
  return request('/api/logistics/authorization/submit', {
    method: 'POST',
    body: params,
  });
}

export async function getRemove(params) {
  return request('/api/logistics/authorization/remove', {
    method: 'POST',
    body: func.toFormData(params),
  });
}

// ============ 打印模板 ===============
export async function getSurfacesingleList(params) {
  return request('/api/logistics/surfacesingle/list', {
    method: 'get',
    body: params,
  });
}
export async function getSurfacesingleSave(params) {
  return request('/api/logistics/surfacesingle/save', {
    method: 'POST',
    body: params,
  });
}
export async function getSurfacesingleRemove(params) {
  return request('/api/logistics/surfacesingle/remove', {
    method: 'POST',
    body: func.toFormData(params),
  });
}
export async function getSurfacesingleSubmit(params) {
  return request('/api/logistics/surfacesingle/submit', {
    method: 'POST',
    body: params,
  });
}
// ============ 寄件配置 ===============
export async function getDeliveryList(params) {
  return request('/api/logistics/delivery/list', {
    method: 'get',
    body: params,
  });
}
export async function getDeliverySave(params) {
  return request('/api/logistics/delivery/save', {
    method: 'POST',
    body: params,
  });
}
