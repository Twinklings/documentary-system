
// import { stringify } from 'qs';
import request from '../../utils/request';
// import func from '../utils/Func';

export async function getList(params) {
    return request('/api/rule', {
      method: 'POST',
      body: params,
    });
}
