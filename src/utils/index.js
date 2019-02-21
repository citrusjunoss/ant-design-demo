import moment from 'moment';
import { ipcRenderer } from 'electron';
import find from 'lodash/find';
import formatGroupMsg from './formatGroupMsg';

export function insertNodes(el, selection, type, content) {
  let range;
  if (type === 'insert') {
    if (el.rangeManage) {
      range = el.rangeManage.range; // eslint-disable-line
      if (!range) {
        el.focus();
      }
    }
    range = selection.getRangeAt(0).cloneRange();
  } else if (type === 'paste') {
    if (selection.deleteFromDocument) {
      selection.deleteFromDocument();
    }
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }
  }
  if (!range.createContextualFragment) {
    range.constructor.prototype.createContextualFragment = html => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement('div');
      fragment.appendChild(div);
      div.outerHTML = html;
      return fragment;
    };
  }
  const fragment = range.createContextualFragment(content);
  const { lastChild } = fragment;
  range.insertNode(fragment);
  range.setEndAfter(lastChild);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * 判断系统
 * @export
 * @param {string} platform  'win' or 'mac'  默认win
 * @return {boolean}
 */
export function checkPlatform(platform = 'win') {
  return (
    window.navigator.platform.toUpperCase().indexOf(platform.toUpperCase()) > -1
  );
}

const { webim } = window;

function formatMsg(type) {
  switch (type) {
    case webim.MSG_ELEMENT_TYPE.IMAGE:
      return '[图片]';
    case webim.MSG_ELEMENT_TYPE.SOUND:
      return '[音频]';
    case webim.MSG_ELEMENT_TYPE.FILE:
      return '[文件]';
    case webim.MSG_ELEMENT_TYPE.LOCATION:
      return '[位置]';
    case webim.MSG_ELEMENT_TYPE.CUSTOM:
      return '[自定义]';
    default:
      return '[其它]';
  }
}

function replaceText(txt) {
  return txt
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

export function formatRecentMsg(msg, senderName) {
  const { MsgType, MsgContent } = msg.MsgBody[0];
  let str = '';
  switch (MsgType) {
    case webim.MSG_ELEMENT_TYPE.TEXT:
      str = replaceText(MsgContent.Text);
      break;
    case webim.MSG_ELEMENT_TYPE.FACE:
      str = MsgContent.Data.replace('静态维小正_', '').replace('维小正_', '');
      break;
    case webim.MSG_ELEMENT_TYPE.CUSTOM:
      return formatCustomMsg(MsgContent.Data);
    default:
      str = formatMsg(MsgType);
      break;
  }
  return `${senderName ? `${senderName}: ` : ''}${str}`;
}

export function formatCustomMsg(data) {
  const { titleKey, typeKey, content, titleName, ...others } = JSON.parse(data);
  if (titleKey === 6910 && typeKey === 6900) {
    const { subject } = JSON.parse(content);
    return `主题名称：${subject}`;
  }
  if (titleKey === 6610 && typeKey === 6600) {
    const { tip } = JSON.parse(content);
    return tip;
  }
  if ((titleKey === 6520 || titleKey === 6510) && typeKey === 6500) {
    return content;
  }
  if (typeKey === 6000) {
    if (titleKey === 6740 || titleKey === 6750) {
      return JSON.parse(content).content;
    }
    return content;
  }
  if (titleKey === 5130 && typeKey === 5100) {
    return content;
  }
  if (titleKey === 5130 && typeKey === 5000) {
    return content;
  }
  if (titleKey === 6813 && typeKey === 6800) {
    const { msg } = JSON.parse(content);
    return msg;
  }
  if (typeKey === 7000) {
    return `[${titleName}]`;
  }
  console.log(titleKey, typeKey, content, titleName, others);
  return '[自定义]';
}

export function formatNotifyMsg(session, { elems, fromAccount, isSend }) {
  const msg = elems[0];

  let senderName = '';

  if (session.sessionType === 'GROUP' && !isSend) {
    const user = find(session.userInfoModels, { sessionId: fromAccount });
    if (user) {
      senderName = user.username ? `${user.username}(${user.name})` : user.name;
    } else {
      senderName = fromAccount;
    }
  }

  let str = '';
  switch (msg.type) {
    case webim.MSG_ELEMENT_TYPE.TEXT:
      str = replaceText(msg.content.text.replace(/&quot;/g, '"'));
      break;
    case webim.MSG_ELEMENT_TYPE.FACE:
      str = msg.content.data.replace('静态维小正_', '').replace('维小正_', '');
      break;
    case webim.MSG_ELEMENT_TYPE.CUSTOM:
      return formatCustomMsg(msg.content.data);
    case webim.MSG_ELEMENT_TYPE.GROUP_TIP:
      console.log(msg);
      return formatGroupMsg(msg.content, session) || '[群通知]';
    default:
      str = formatMsg(msg.type);
      break;
  }
  return `${senderName ? `${senderName}: ` : ''}${str}`;
}

export function getTimeStr(timestamp) {
  if (!timestamp) return '';
  const time = moment.unix(timestamp);
  if (time.isSame(moment().startOf('day'), 'd')) {
    const seconds = moment().diff(time, 'seconds');
    const minutes = moment().diff(time, 'minutes');
    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    return time.format('HH:mm');
  }
  const yesterday = moment().subtract(1, 'days');
  if (time.isSame(yesterday.startOf('day'), 'd')) {
    return `昨天 ${time.format('HH:mm')}`;
  }
  if (time.isSame(moment().startOf('year'), 'y')) {
    return time.format('MM月DD日 HH:mm');
  }
  return time.format('YYYY年MM月DD日 HH:mm');
}

export function getShortTimeStr(timestamp) {
  if (!timestamp) return '';
  const time = moment.unix(timestamp);
  if (time.isSame(moment().startOf('day'), 'd')) {
    const seconds = moment().diff(time, 'seconds');
    const minutes = moment().diff(time, 'minutes');
    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    return time.format('HH:mm');
  }
  const yesterday = moment().subtract(1, 'days');
  if (time.isSame(yesterday.startOf('day'), 'd')) {
    return '昨天';
  }
  if (time.isSame(moment().startOf('year'), 'y')) {
    return time.format('MM-DD');
  }
  return time.format('YY-MM-DD');
}

export function preDepartmentParentList(ids, names, keyValues) {
  const result = [];
  const idArr = ids.split(';');
  const nameArr = names.split(';');
  idArr.forEach((element, index) => {
    result.push({
      departmentId: element,
      departmentName: nameArr[index],
      ...keyValues
    });
  });
  return result;
}

export function textToImg(text, fontsize, fontcolor) {
  const canvas = document.createElement('canvas');
  // 小于32字加1  小于60字加2  小于80字加4    小于100字加6
  let $buHeight = 0;
  if (fontsize <= 32) {
    $buHeight = 1;
  } else if (fontsize > 32 && fontsize <= 60) {
    $buHeight = 2;
  } else if (fontsize > 60 && fontsize <= 80) {
    $buHeight = 4;
  } else if (fontsize > 80 && fontsize <= 100) {
    $buHeight = 6;
  } else if (fontsize > 100) {
    $buHeight = 10;
  }
  // 对于g j 等有时会有遮挡，这里增加一些高度
  canvas.height = fontsize + $buHeight;
  const context = canvas.getContext('2d');
  // 擦除(0,0)位置大小为200x200的矩形，擦除的意思是把该区域变为透明
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = fontcolor;
  context.font = `${fontsize}px Arial`;
  // top（顶部对齐） hanging（悬挂） middle（中间对齐） bottom（底部对齐） alphabetic是默认值
  context.textBaseline = 'middle';
  context.fillText(text, 0, fontsize / 2);

  // 如果在这里直接设置宽度和高度会造成内容丢失 , 暂时未找到原因 , 可以用以下方案临时解决
  // canvas.width = context.measureText(text).width;

  // 方案一：可以先复制内容  然后设置宽度 最后再黏贴
  // 方案二：创建新的canvas,把旧的canvas内容黏贴过去
  // 方案三： 上边设置完宽度后，再设置一遍文字

  // 方案一： 这个经过测试有问题，字体变大后，显示不全,原因是canvas默认的宽度不够，
  // 如果一开始就给canvas一个很大的宽度的话，这个是可以的。
  // var imgData = context.getImageData(0,0,canvas.width,canvas.height);  //这里先复制原来的canvas里的内容
  // canvas.width = context.measureText(text).width;  //然后设置宽和高
  // context.putImageData(imgData,0,0); //最后黏贴复制的内容

  // 方案三：改变大小后，重新设置一次文字
  canvas.width = context.measureText(text).width;
  context.fillStyle = fontcolor;
  context.font = `${fontsize}px Arial`;
  context.textBaseline = 'middle';
  context.fillText(text, 0, fontsize / 2);

  const dataUrl = canvas.toDataURL('image/png'); // 注意这里背景透明的话，需要使用png
  return dataUrl;
}

export function arraySplite(array = [], limit = 0) {
  const len = array.length;
  if (limit > 0 && len > limit) {
    return array.slice(0, limit);
  }
  return array;
}

export function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export function signout() {
  const signForm = JSON.parse(localStorage.getItem('signForm') || '{}');
  localStorage.setItem(
    'signForm',
    JSON.stringify({ account: signForm.account || '' })
  );
  localStorage.removeItem('userInfo');
  ipcRenderer.send('signout');
}

export default {};
