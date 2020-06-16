import { notification } from 'antd';

const codeMessage: { [key: number]: string } = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const baseUrl = process.env.APP_API_BASEURL || '';
const headers = new Headers({
  "Content-Type": "application/json;charset=utf-8",
});

function fetchRequest(url: string, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any, config?: { header?: Headers, formdata?: boolean }) {
  return fetch(`${baseUrl}${url}`, {
    method: method || 'GET',
    headers: config?.header ?? headers,
    body: !data ? null : config && config.formdata ? data : JSON.stringify(data)
  }).then((res) => {
    if (!res.ok) { // 404 500等错误状态码
      const errMsg = res.statusText || codeMessage[res.status];

      notification.error({
        message: `请求错误 ${res.status}`,
        description: errMsg,
      });
    } else {
      const resultType = async () => {
        const contentType = res.headers.get('Content-Type');
        // 判定返回的内容类型，做不同的处理
        if (contentType) {
          if (contentType.indexOf('json') > -1) {
            return await res.json()
          }
          if (contentType.indexOf('text') > -1) {
            return await res.text()
          }
          if (contentType.indexOf('form') > -1) {
            return await res.formData()
          }
          if (contentType.indexOf('video') > -1) {
            return await res.blob()
          }
        }
      }
      return resultType();
    }
  }).then((res) => {
    return res;
  }).catch((error) => { // 网络故障或请求被阻止
    notification.error({
      message: '网络异常',
      description: '您的网络发生异常，无法连接服务器',
    });
    return Promise.reject(error);
  })
}


const get = (url: string, data?: any, ) => {
  return fetchRequest(url, data);
}
const post = (url: string, data?: any, config?: { header?: Headers, formdata?: boolean }) => {
  return fetchRequest(url, 'POST', data, config);
}
const put = (url: string, data?: any) => {
  return fetchRequest(url, 'PUT', data);
}
const del = (url: string, data?: any) => {
  return fetchRequest(url, 'DELETE', data);
}

export default { get, post, put, del };