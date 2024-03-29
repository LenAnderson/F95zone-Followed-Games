// ==UserScript==
// @name         F95zone - Followed Games
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/F95zone-Followed-Games/raw/master/F95zone-Followed-Games.user.js
// @version      1.9.0
// @author       LenAnderson
// @match        https://f95zone.to/*
// @grant        none
// ==/UserScript==



(async()=>{
	'use strict';

	const log = (...msgs)=>console.log.call(console.log, '[FFG]', ...msgs);
	
	
	const $ = (root,query)=>(query?root:document).querySelector(query?query:root);
	const $$ = (root,query)=>Array.from((query?root:document).querySelectorAll(query?query:root));


	const get = (url) => {
		return new Promise((resolve,reject)=>{
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.addEventListener('load', ()=>{
				resolve(xhr.responseText);
			});
			xhr.addEventListener('error', ()=>{
				reject(xhr);
			});
			xhr.send();
		});
	};
	const getHtml = (url) => {
		return get(url).then(txt=>{
			const html = document.createElement('div');
			html.innerHTML = txt;
			return html;
		});
	};


	const wait = async(millis)=>new Promise(resolve=>setTimeout(resolve, millis));

// ---------------- IMPORTS  ----------------



// src\strtotime.js
const reSpace = '[ \\t]+'
const reSpaceOpt = '[ \\t]*'
const reMeridian = '(?:([ap])\\.?m\\.?([\\t ]|$))'
const reHour24 = '(2[0-4]|[01]?[0-9])'
const reHour24lz = '([01][0-9]|2[0-4])'
const reHour12 = '(0?[1-9]|1[0-2])'
const reMinute = '([0-5]?[0-9])'
const reMinutelz = '([0-5][0-9])'
const reSecond = '(60|[0-5]?[0-9])'
const reSecondlz = '(60|[0-5][0-9])'
const reFrac = '(?:\\.([0-9]+))'
const reDayfull = 'sunday|monday|tuesday|wednesday|thursday|friday|saturday'
const reDayabbr = 'sun|mon|tue|wed|thu|fri|sat'
const reDaytext = reDayfull + '|' + reDayabbr + '|weekdays?'
const reReltextnumber = 'first|second|third|fourth|fifth|sixth|seventh|eighth?|ninth|tenth|eleventh|twelfth'
const reReltexttext = 'next|last|previous|this'
const reReltextunit = '(?:second|sec|minute|min|hour|day|fortnight|forthnight|month|year)s?|weeks|' + reDaytext
const reYear = '([0-9]{1,4})'
const reYear2 = '([0-9]{2})'
const reYear4 = '([0-9]{4})'
const reYear4withSign = '([+-]?[0-9]{4})'
const reMonth = '(1[0-2]|0?[0-9])'
const reMonthlz = '(0[0-9]|1[0-2])'
const reDay = '(?:(3[01]|[0-2]?[0-9])(?:st|nd|rd|th)?)'
const reDaylz = '(0[0-9]|[1-2][0-9]|3[01])'
const reMonthFull = 'january|february|march|april|may|june|july|august|september|october|november|december'
const reMonthAbbr = 'jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec'
const reMonthroman = 'i[vx]|vi{0,3}|xi{0,2}|i{1,3}'
const reMonthText = '(' + reMonthFull + '|' + reMonthAbbr + '|' + reMonthroman + ')'
const reTzCorrection = '((?:GMT)?([+-])' + reHour24 + ':?' + reMinute + '?)'
const reTzAbbr = '\\(?([a-zA-Z]{1,6})\\)?'
const reDayOfYear = '(00[1-9]|0[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6])'
const reWeekOfYear = '(0[1-9]|[1-4][0-9]|5[0-3])'
const reDateNoYear = reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]*'
function processMeridian (hour, meridian) {
  meridian = meridian && meridian.toLowerCase()
  switch (meridian) {
    case 'a':
      hour += hour === 12 ? -12 : 0
      break
    case 'p':
      hour += hour !== 12 ? 12 : 0
      break
  }
  return hour
}
function processYear (yearStr) {
  let year = +yearStr
  if (yearStr.length < 4 && year < 100) {
    year += year < 70 ? 2000 : 1900
  }
  return year
}
function lookupMonth (monthStr) {
  return {
    jan: 0,
    january: 0,
    i: 0,
    feb: 1,
    february: 1,
    ii: 1,
    mar: 2,
    march: 2,
    iii: 2,
    apr: 3,
    april: 3,
    iv: 3,
    may: 4,
    v: 4,
    jun: 5,
    june: 5,
    vi: 5,
    jul: 6,
    july: 6,
    vii: 6,
    aug: 7,
    august: 7,
    viii: 7,
    sep: 8,
    sept: 8,
    september: 8,
    ix: 8,
    oct: 9,
    october: 9,
    x: 9,
    nov: 10,
    november: 10,
    xi: 10,
    dec: 11,
    december: 11,
    xii: 11
  }[monthStr.toLowerCase()]
}
function lookupWeekday (dayStr, desiredSundayNumber = 0) {
  const dayNumbers = {
    mon: 1,
    monday: 1,
    tue: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
    sun: 0,
    sunday: 0
  }
  return dayNumbers[dayStr.toLowerCase()] || desiredSundayNumber
}
function lookupRelative (relText) {
  const relativeNumbers = {
    last: -1,
    previous: -1,
    this: 0,
    first: 1,
    next: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eight: 8,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12
  }
  const relativeBehavior = {
    this: 1
  }
  const relTextLower = relText.toLowerCase()
  return {
    amount: relativeNumbers[relTextLower],
    behavior: relativeBehavior[relTextLower] || 0
  }
}
function processTzCorrection (tzOffset, oldValue) {
  const reTzCorrectionLoose = /(?:GMT)?([+-])(\d+)(:?)(\d{0,2})/i
  tzOffset = tzOffset && tzOffset.match(reTzCorrectionLoose)
  if (!tzOffset) {
    return oldValue
  }
  const sign = tzOffset[1] === '-' ? -1 : 1
  let hours = +tzOffset[2]
  let minutes = +tzOffset[4]
  if (!tzOffset[4] && !tzOffset[3]) {
    minutes = Math.floor(hours % 100)
    hours = Math.floor(hours / 100)
  }
  // timezone offset in seconds
  return sign * (hours * 60 + minutes) * 60
}
// tz abbrevation : tz offset in seconds
const tzAbbrOffsets = {
  acdt: 37800,
  acst: 34200,
  addt: -7200,
  adt: -10800,
  aedt: 39600,
  aest: 36000,
  ahdt: -32400,
  ahst: -36000,
  akdt: -28800,
  akst: -32400,
  amt: -13840,
  apt: -10800,
  ast: -14400,
  awdt: 32400,
  awst: 28800,
  awt: -10800,
  bdst: 7200,
  bdt: -36000,
  bmt: -14309,
  bst: 3600,
  cast: 34200,
  cat: 7200,
  cddt: -14400,
  cdt: -18000,
  cemt: 10800,
  cest: 7200,
  cet: 3600,
  cmt: -15408,
  cpt: -18000,
  cst: -21600,
  cwt: -18000,
  chst: 36000,
  dmt: -1521,
  eat: 10800,
  eddt: -10800,
  edt: -14400,
  eest: 10800,
  eet: 7200,
  emt: -26248,
  ept: -14400,
  est: -18000,
  ewt: -14400,
  ffmt: -14660,
  fmt: -4056,
  gdt: 39600,
  gmt: 0,
  gst: 36000,
  hdt: -34200,
  hkst: 32400,
  hkt: 28800,
  hmt: -19776,
  hpt: -34200,
  hst: -36000,
  hwt: -34200,
  iddt: 14400,
  idt: 10800,
  imt: 25025,
  ist: 7200,
  jdt: 36000,
  jmt: 8440,
  jst: 32400,
  kdt: 36000,
  kmt: 5736,
  kst: 30600,
  lst: 9394,
  mddt: -18000,
  mdst: 16279,
  mdt: -21600,
  mest: 7200,
  met: 3600,
  mmt: 9017,
  mpt: -21600,
  msd: 14400,
  msk: 10800,
  mst: -25200,
  mwt: -21600,
  nddt: -5400,
  ndt: -9052,
  npt: -9000,
  nst: -12600,
  nwt: -9000,
  nzdt: 46800,
  nzmt: 41400,
  nzst: 43200,
  pddt: -21600,
  pdt: -25200,
  pkst: 21600,
  pkt: 18000,
  plmt: 25590,
  pmt: -13236,
  ppmt: -17340,
  ppt: -25200,
  pst: -28800,
  pwt: -25200,
  qmt: -18840,
  rmt: 5794,
  sast: 7200,
  sdmt: -16800,
  sjmt: -20173,
  smt: -13884,
  sst: -39600,
  tbmt: 10751,
  tmt: 12344,
  uct: 0,
  utc: 0,
  wast: 7200,
  wat: 3600,
  wemt: 7200,
  west: 3600,
  wet: 0,
  wib: 25200,
  wita: 28800,
  wit: 32400,
  wmt: 5040,
  yddt: -25200,
  ydt: -28800,
  ypt: -28800,
  yst: -32400,
  ywt: -28800,
  a: 3600,
  b: 7200,
  c: 10800,
  d: 14400,
  e: 18000,
  f: 21600,
  g: 25200,
  h: 28800,
  i: 32400,
  k: 36000,
  l: 39600,
  m: 43200,
  n: -3600,
  o: -7200,
  p: -10800,
  q: -14400,
  r: -18000,
  s: -21600,
  t: -25200,
  u: -28800,
  v: -32400,
  w: -36000,
  x: -39600,
  y: -43200,
  z: 0
}
const formats = {
  yesterday: {
    regex: /^yesterday/i,
    name: 'yesterday',
    callback () {
      this.rd -= 1
      return this.resetTime()
    }
  },
  now: {
    regex: /^now/i,
    name: 'now'
    // do nothing
  },
  noon: {
    regex: /^noon/i,
    name: 'noon',
    callback () {
      return this.resetTime() && this.time(12, 0, 0, 0)
    }
  },
  midnightOrToday: {
    regex: /^(midnight|today)/i,
    name: 'midnight | today',
    callback () {
      return this.resetTime()
    }
  },
  tomorrow: {
    regex: /^tomorrow/i,
    name: 'tomorrow',
    callback () {
      this.rd += 1
      return this.resetTime()
    }
  },
  timestamp: {
    regex: /^@(-?\d+)/i,
    name: 'timestamp',
    callback (match, timestamp) {
      this.rs += +timestamp
      this.y = 1970
      this.m = 0
      this.d = 1
      this.dates = 0
      return this.resetTime() && this.zone(0)
    }
  },
  firstOrLastDay: {
    regex: /^(first|last) day of/i,
    name: 'firstdayof | lastdayof',
    callback (match, day) {
      if (day.toLowerCase() === 'first') {
        this.firstOrLastDayOfMonth = 1
      } else {
        this.firstOrLastDayOfMonth = -1
      }
    }
  },
  backOrFrontOf: {
    regex: RegExp('^(back|front) of ' + reHour24 + reSpaceOpt + reMeridian + '?', 'i'),
    name: 'backof | frontof',
    callback (match, side, hours, meridian) {
      const back = side.toLowerCase() === 'back'
      let hour = +hours
      let minute = 15
      if (!back) {
        hour -= 1
        minute = 45
      }
      hour = processMeridian(hour, meridian)
      return this.resetTime() && this.time(hour, minute, 0, 0)
    }
  },
  weekdayOf: {
    regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' + reDayfull + '|' + reDayabbr + ')' + reSpace + 'of', 'i'),
    name: 'weekdayof'
    // todo
  },
  mssqltime: {
    regex: RegExp('^' + reHour12 + ':' + reMinutelz + ':' + reSecondlz + '[:.]([0-9]+)' + reMeridian, 'i'),
    name: 'mssqltime',
    callback (match, hour, minute, second, frac, meridian) {
      return this.time(processMeridian(+hour, meridian), +minute, +second, +frac.substr(0, 3))
    }
  },
  timeLong12: {
    regex: RegExp('^' + reHour12 + '[:.]' + reMinute + '[:.]' + reSecondlz + reSpaceOpt + reMeridian, 'i'),
    name: 'timelong12',
    callback (match, hour, minute, second, meridian) {
      return this.time(processMeridian(+hour, meridian), +minute, +second, 0)
    }
  },
  timeShort12: {
    regex: RegExp('^' + reHour12 + '[:.]' + reMinutelz + reSpaceOpt + reMeridian, 'i'),
    name: 'timeshort12',
    callback (match, hour, minute, meridian) {
      return this.time(processMeridian(+hour, meridian), +minute, 0, 0)
    }
  },
  timeTiny12: {
    regex: RegExp('^' + reHour12 + reSpaceOpt + reMeridian, 'i'),
    name: 'timetiny12',
    callback (match, hour, meridian) {
      return this.time(processMeridian(+hour, meridian), 0, 0, 0)
    }
  },
  soap: {
    regex: RegExp('^' + reYear4 + '-' + reMonthlz + '-' + reDaylz + 'T' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz + reFrac + reTzCorrection + '?', 'i'),
    name: 'soap',
    callback (match, year, month, day, hour, minute, second, frac, tzCorrection) {
      return this.ymd(+year, month - 1, +day) &&
              this.time(+hour, +minute, +second, +frac.substr(0, 3)) &&
              this.zone(processTzCorrection(tzCorrection))
    }
  },
  wddx: {
    regex: RegExp('^' + reYear4 + '-' + reMonth + '-' + reDay + 'T' + reHour24 + ':' + reMinute + ':' + reSecond),
    name: 'wddx',
    callback (match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0)
    }
  },
  exif: {
    regex: RegExp('^' + reYear4 + ':' + reMonthlz + ':' + reDaylz + ' ' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz, 'i'),
    name: 'exif',
    callback (match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0)
    }
  },
  xmlRpc: {
    regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + 'T' + reHour24 + ':' + reMinutelz + ':' + reSecondlz),
    name: 'xmlrpc',
    callback (match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0)
    }
  },
  xmlRpcNoColon: {
    regex: RegExp('^' + reYear4 + reMonthlz + reDaylz + '[Tt]' + reHour24 + reMinutelz + reSecondlz),
    name: 'xmlrpcnocolon',
    callback (match, year, month, day, hour, minute, second) {
      return this.ymd(+year, month - 1, +day) && this.time(+hour, +minute, +second, 0)
    }
  },
  clf: {
    regex: RegExp('^' + reDay + '/(' + reMonthAbbr + ')/' + reYear4 + ':' + reHour24lz + ':' + reMinutelz + ':' + reSecondlz + reSpace + reTzCorrection, 'i'),
    name: 'clf',
    callback (match, day, month, year, hour, minute, second, tzCorrection) {
      return this.ymd(+year, lookupMonth(month), +day) &&
              this.time(+hour, +minute, +second, 0) &&
              this.zone(processTzCorrection(tzCorrection))
    }
  },
  iso8601long: {
    regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond + reFrac, 'i'),
    name: 'iso8601long',
    callback (match, hour, minute, second, frac) {
      return this.time(+hour, +minute, +second, +frac.substr(0, 3))
    }
  },
  dateTextual: {
    regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reDay + '[,.stndrh\\t ]+' + reYear, 'i'),
    name: 'datetextual',
    callback (match, month, day, year) {
      return this.ymd(processYear(year), lookupMonth(month), +day)
    }
  },
  pointedDate4: {
    regex: RegExp('^' + reDay + '[.\\t-]' + reMonth + '[.-]' + reYear4),
    name: 'pointeddate4',
    callback (match, day, month, year) {
      return this.ymd(+year, month - 1, +day)
    }
  },
  pointedDate2: {
    regex: RegExp('^' + reDay + '[.\\t]' + reMonth + '\\.' + reYear2),
    name: 'pointeddate2',
    callback (match, day, month, year) {
      return this.ymd(processYear(year), month - 1, +day)
    }
  },
  timeLong24: {
    regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond),
    name: 'timelong24',
    callback (match, hour, minute, second) {
      return this.time(+hour, +minute, +second, 0)
    }
  },
  dateNoColon: {
    regex: RegExp('^' + reYear4 + reMonthlz + reDaylz),
    name: 'datenocolon',
    callback (match, year, month, day) {
      return this.ymd(+year, month - 1, +day)
    }
  },
  pgydotd: {
    regex: RegExp('^' + reYear4 + '\\.?' + reDayOfYear),
    name: 'pgydotd',
    callback (match, year, day) {
      return this.ymd(+year, 0, +day)
    }
  },
  timeShort24: {
    regex: RegExp('^t?' + reHour24 + '[:.]' + reMinute, 'i'),
    name: 'timeshort24',
    callback (match, hour, minute) {
      return this.time(+hour, +minute, 0, 0)
    }
  },
  iso8601noColon: {
    regex: RegExp('^t?' + reHour24lz + reMinutelz + reSecondlz, 'i'),
    name: 'iso8601nocolon',
    callback (match, hour, minute, second) {
      return this.time(+hour, +minute, +second, 0)
    }
  },
  iso8601dateSlash: {
    // eventhough the trailing slash is optional in PHP
    // here it's mandatory and inputs without the slash
    // are handled by dateslash
    regex: RegExp('^' + reYear4 + '/' + reMonthlz + '/' + reDaylz + '/'),
    name: 'iso8601dateslash',
    callback (match, year, month, day) {
      return this.ymd(+year, month - 1, +day)
    }
  },
  dateSlash: {
    regex: RegExp('^' + reYear4 + '/' + reMonth + '/' + reDay),
    name: 'dateslash',
    callback (match, year, month, day) {
      return this.ymd(+year, month - 1, +day)
    }
  },
  american: {
    regex: RegExp('^' + reMonth + '/' + reDay + '/' + reYear),
    name: 'american',
    callback (match, month, day, year) {
      return this.ymd(processYear(year), month - 1, +day)
    }
  },
  americanShort: {
    regex: RegExp('^' + reMonth + '/' + reDay),
    name: 'americanshort',
    callback (match, month, day) {
      return this.ymd(this.y, month - 1, +day)
    }
  },
  gnuDateShortOrIso8601date2: {
    // iso8601date2 is complete subset of gnudateshort
    regex: RegExp('^' + reYear + '-' + reMonth + '-' + reDay),
    name: 'gnudateshort | iso8601date2',
    callback (match, year, month, day) {
      return this.ymd(processYear(year), month - 1, +day)
    }
  },
  iso8601date4: {
    regex: RegExp('^' + reYear4withSign + '-' + reMonthlz + '-' + reDaylz),
    name: 'iso8601date4',
    callback (match, year, month, day) {
      return this.ymd(+year, month - 1, +day)
    }
  },
  gnuNoColon: {
    regex: RegExp('^t?' + reHour24lz + reMinutelz, 'i'),
    name: 'gnunocolon',
    callback (match, hour, minute) {
      // this rule is a special case
      // if time was already set once by any preceding rule, it sets the captured value as year
      switch (this.times) {
        case 0:
          return this.time(+hour, +minute, 0, this.f)
        case 1:
          this.y = hour * 100 + +minute
          this.times++
          return true
        default:
          return false
      }
    }
  },
  gnuDateShorter: {
    regex: RegExp('^' + reYear4 + '-' + reMonth),
    name: 'gnudateshorter',
    callback (match, year, month) {
      return this.ymd(+year, month - 1, 1)
    }
  },
  pgTextReverse: {
    // note: allowed years are from 32-9999
    // years below 32 should be treated as days in datefull
    regex: RegExp('^' + '(\\d{3,4}|[4-9]\\d|3[2-9])-(' + reMonthAbbr + ')-' + reDaylz, 'i'),
    name: 'pgtextreverse',
    callback (match, year, month, day) {
      return this.ymd(processYear(year), lookupMonth(month), +day)
    }
  },
  dateFull: {
    regex: RegExp('^' + reDay + '[ \\t.-]*' + reMonthText + '[ \\t.-]*' + reYear, 'i'),
    name: 'datefull',
    callback (match, day, month, year) {
      return this.ymd(processYear(year), lookupMonth(month), +day)
    }
  },
  dateNoDay: {
    regex: RegExp('^' + reMonthText + '[ .\\t-]*' + reYear4, 'i'),
    name: 'datenoday',
    callback (match, month, year) {
      return this.ymd(+year, lookupMonth(month), 1)
    }
  },
  dateNoDayRev: {
    regex: RegExp('^' + reYear4 + '[ .\\t-]*' + reMonthText, 'i'),
    name: 'datenodayrev',
    callback (match, year, month) {
      return this.ymd(+year, lookupMonth(month), 1)
    }
  },
  pgTextShort: {
    regex: RegExp('^(' + reMonthAbbr + ')-' + reDaylz + '-' + reYear, 'i'),
    name: 'pgtextshort',
    callback (match, month, day, year) {
      return this.ymd(processYear(year), lookupMonth(month), +day)
    }
  },
  dateNoYear: {
    regex: RegExp('^' + reDateNoYear, 'i'),
    name: 'datenoyear',
    callback (match, month, day) {
      return this.ymd(this.y, lookupMonth(month), +day)
    }
  },
  dateNoYearRev: {
    regex: RegExp('^' + reDay + '[ .\\t-]*' + reMonthText, 'i'),
    name: 'datenoyearrev',
    callback (match, day, month) {
      return this.ymd(this.y, lookupMonth(month), +day)
    }
  },
  isoWeekDay: {
    regex: RegExp('^' + reYear4 + '-?W' + reWeekOfYear + '(?:-?([0-7]))?'),
    name: 'isoweekday | isoweek',
    callback (match, year, week, day) {
      day = day ? +day : 1
      if (!this.ymd(+year, 0, 1)) {
        return false
      }
      // get day of week for Jan 1st
      let dayOfWeek = new Date(this.y, this.m, this.d).getDay()
      // and use the day to figure out the offset for day 1 of week 1
      dayOfWeek = 0 - (dayOfWeek > 4 ? dayOfWeek - 7 : dayOfWeek)
      this.rd += dayOfWeek + ((week - 1) * 7) + day
    }
  },
  relativeText: {
    regex: RegExp('^(' + reReltextnumber + '|' + reReltexttext + ')' + reSpace + '(' + reReltextunit + ')', 'i'),
    name: 'relativetext',
    callback (match, relValue, relUnit) {
      // todo: implement handling of 'this time-unit'
      // eslint-disable-next-line no-unused-vars
      const { amount, behavior } = lookupRelative(relValue)
      switch (relUnit.toLowerCase()) {
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
          this.rs += amount
          break
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
          this.ri += amount
          break
        case 'hour':
        case 'hours':
          this.rh += amount
          break
        case 'day':
        case 'days':
          this.rd += amount
          break
        case 'fortnight':
        case 'fortnights':
        case 'forthnight':
        case 'forthnights':
          this.rd += amount * 14
          break
        case 'week':
        case 'weeks':
          this.rd += amount * 7
          break
        case 'month':
        case 'months':
          this.rm += amount
          break
        case 'year':
        case 'years':
          this.ry += amount
          break
        case 'mon': case 'monday':
        case 'tue': case 'tuesday':
        case 'wed': case 'wednesday':
        case 'thu': case 'thursday':
        case 'fri': case 'friday':
        case 'sat': case 'saturday':
        case 'sun': case 'sunday':
          this.resetTime()
          this.weekday = lookupWeekday(relUnit, 7)
          this.weekdayBehavior = 1
          this.rd += (amount > 0 ? amount - 1 : amount) * 7
          break
        case 'weekday':
        case 'weekdays':
          // todo
          break
      }
    }
  },
  relative: {
    regex: RegExp('^([+-]*)[ \\t]*(\\d+)' + reSpaceOpt + '(' + reReltextunit + '|week)', 'i'),
    name: 'relative',
    callback (match, signs, relValue, relUnit) {
      const minuses = signs.replace(/[^-]/g, '').length
      const amount = +relValue * Math.pow(-1, minuses)
      switch (relUnit.toLowerCase()) {
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
          this.rs += amount
          break
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
          this.ri += amount
          break
        case 'hour':
        case 'hours':
          this.rh += amount
          break
        case 'day':
        case 'days':
          this.rd += amount
          break
        case 'fortnight':
        case 'fortnights':
        case 'forthnight':
        case 'forthnights':
          this.rd += amount * 14
          break
        case 'week':
        case 'weeks':
          this.rd += amount * 7
          break
        case 'month':
        case 'months':
          this.rm += amount
          break
        case 'year':
        case 'years':
          this.ry += amount
          break
        case 'mon': case 'monday':
        case 'tue': case 'tuesday':
        case 'wed': case 'wednesday':
        case 'thu': case 'thursday':
        case 'fri': case 'friday':
        case 'sat': case 'saturday':
        case 'sun': case 'sunday':
          this.resetTime()
          this.weekday = lookupWeekday(relUnit, 7)
          this.weekdayBehavior = 1
          this.rd += (amount > 0 ? amount - 1 : amount) * 7
          break
        case 'weekday':
        case 'weekdays':
          // todo
          break
      }
    }
  },
  dayText: {
    regex: RegExp('^(' + reDaytext + ')', 'i'),
    name: 'daytext',
    callback (match, dayText) {
      this.resetTime()
      this.weekday = lookupWeekday(dayText, 0)
      if (this.weekdayBehavior !== 2) {
        this.weekdayBehavior = 1
      }
    }
  },
  relativeTextWeek: {
    regex: RegExp('^(' + reReltexttext + ')' + reSpace + 'week', 'i'),
    name: 'relativetextweek',
    callback (match, relText) {
      this.weekdayBehavior = 2
      switch (relText.toLowerCase()) {
        case 'this':
          this.rd += 0
          break
        case 'next':
          this.rd += 7
          break
        case 'last':
        case 'previous':
          this.rd -= 7
          break
      }
      if (isNaN(this.weekday)) {
        this.weekday = 1
      }
    }
  },
  monthFullOrMonthAbbr: {
    regex: RegExp('^(' + reMonthFull + '|' + reMonthAbbr + ')', 'i'),
    name: 'monthfull | monthabbr',
    callback (match, month) {
      return this.ymd(this.y, lookupMonth(month), this.d)
    }
  },
  tzCorrection: {
    regex: RegExp('^' + reTzCorrection, 'i'),
    name: 'tzcorrection',
    callback (tzCorrection) {
      return this.zone(processTzCorrection(tzCorrection))
    }
  },
  tzAbbr: {
    regex: RegExp('^' + reTzAbbr),
    name: 'tzabbr',
    callback (match, abbr) {
      const offset = tzAbbrOffsets[abbr.toLowerCase()]
      if (isNaN(offset)) {
        return false
      }
      return this.zone(offset)
    }
  },
  ago: {
    regex: /^ago/i,
    name: 'ago',
    callback () {
      this.ry = -this.ry
      this.rm = -this.rm
      this.rd = -this.rd
      this.rh = -this.rh
      this.ri = -this.ri
      this.rs = -this.rs
      this.rf = -this.rf
    }
  },
  year4: {
    regex: RegExp('^' + reYear4),
    name: 'year4',
    callback (match, year) {
      this.y = +year
      return true
    }
  },
  whitespace: {
    regex: /^[ .,\t]+/,
    name: 'whitespace'
    // do nothing
  },
  dateShortWithTimeLong: {
    regex: RegExp('^' + reDateNoYear + 't?' + reHour24 + '[:.]' + reMinute + '[:.]' + reSecond, 'i'),
    name: 'dateshortwithtimelong',
    callback (match, month, day, hour, minute, second) {
      return this.ymd(this.y, lookupMonth(month), +day) && this.time(+hour, +minute, +second, 0)
    }
  },
  dateShortWithTimeLong12: {
    regex: RegExp('^' + reDateNoYear + reHour12 + '[:.]' + reMinute + '[:.]' + reSecondlz + reSpaceOpt + reMeridian, 'i'),
    name: 'dateshortwithtimelong12',
    callback (match, month, day, hour, minute, second, meridian) {
      return this.ymd(this.y, lookupMonth(month), +day) && this.time(processMeridian(+hour, meridian), +minute, +second, 0)
    }
  },
  dateShortWithTimeShort: {
    regex: RegExp('^' + reDateNoYear + 't?' + reHour24 + '[:.]' + reMinute, 'i'),
    name: 'dateshortwithtimeshort',
    callback (match, month, day, hour, minute) {
      return this.ymd(this.y, lookupMonth(month), +day) && this.time(+hour, +minute, 0, 0)
    }
  },
  dateShortWithTimeShort12: {
    regex: RegExp('^' + reDateNoYear + reHour12 + '[:.]' + reMinutelz + reSpaceOpt + reMeridian, 'i'),
    name: 'dateshortwithtimeshort12',
    callback (match, month, day, hour, minute, meridian) {
      return this.ymd(this.y, lookupMonth(month), +day) && this.time(processMeridian(+hour, meridian), +minute, 0, 0)
    }
  }
}
const resultProto = {
  // date
  y: NaN,
  m: NaN,
  d: NaN,
  // time
  h: NaN,
  i: NaN,
  s: NaN,
  f: NaN,
  // relative shifts
  ry: 0,
  rm: 0,
  rd: 0,
  rh: 0,
  ri: 0,
  rs: 0,
  rf: 0,
  // weekday related shifts
  weekday: NaN,
  weekdayBehavior: 0,
  // first or last day of month
  // 0 none, 1 first, -1 last
  firstOrLastDayOfMonth: 0,
  // timezone correction in minutes
  z: NaN,
  // counters
  dates: 0,
  times: 0,
  zones: 0,
  // helper functions
  ymd (y, m, d) {
    if (this.dates > 0) {
      return false
    }
    this.dates++
    this.y = y
    this.m = m
    this.d = d
    return true
  },
  time (h, i, s, f) {
    if (this.times > 0) {
      return false
    }
    this.times++
    this.h = h
    this.i = i
    this.s = s
    this.f = f
    return true
  },
  resetTime () {
    this.h = 0
    this.i = 0
    this.s = 0
    this.f = 0
    this.times = 0
    return true
  },
  zone (minutes) {
    if (this.zones <= 1) {
      this.zones++
      this.z = minutes
      return true
    }
    return false
  },
  toDate (relativeTo) {
    if (this.dates && !this.times) {
      this.h = this.i = this.s = this.f = 0
    }
    // fill holes
    if (isNaN(this.y)) {
      this.y = relativeTo.getFullYear()
    }
    if (isNaN(this.m)) {
      this.m = relativeTo.getMonth()
    }
    if (isNaN(this.d)) {
      this.d = relativeTo.getDate()
    }
    if (isNaN(this.h)) {
      this.h = relativeTo.getHours()
    }
    if (isNaN(this.i)) {
      this.i = relativeTo.getMinutes()
    }
    if (isNaN(this.s)) {
      this.s = relativeTo.getSeconds()
    }
    if (isNaN(this.f)) {
      this.f = relativeTo.getMilliseconds()
    }
    // adjust special early
    switch (this.firstOrLastDayOfMonth) {
      case 1:
        this.d = 1
        break
      case -1:
        this.d = 0
        this.m += 1
        break
    }
    if (!isNaN(this.weekday)) {
      const date = new Date(relativeTo.getTime())
      date.setFullYear(this.y, this.m, this.d)
      date.setHours(this.h, this.i, this.s, this.f)
      const dow = date.getDay()
      if (this.weekdayBehavior === 2) {
        // To make "this week" work, where the current day of week is a "sunday"
        if (dow === 0 && this.weekday !== 0) {
          this.weekday = -6
        }
        // To make "sunday this week" work, where the current day of week is not a "sunday"
        if (this.weekday === 0 && dow !== 0) {
          this.weekday = 7
        }
        this.d -= dow
        this.d += this.weekday
      } else {
        let diff = this.weekday - dow
        // some PHP magic
        if ((this.rd < 0 && diff < 0) || (this.rd >= 0 && diff <= -this.weekdayBehavior)) {
          diff += 7
        }
        if (this.weekday >= 0) {
          this.d += diff
        } else {
          this.d -= (7 - (Math.abs(this.weekday) - dow))
        }
        this.weekday = NaN
      }
    }
    // adjust relative
    this.y += this.ry
    this.m += this.rm
    this.d += this.rd
    this.h += this.rh
    this.i += this.ri
    this.s += this.rs
    this.f += this.rf
    this.ry = this.rm = this.rd = 0
    this.rh = this.ri = this.rs = this.rf = 0
    const result = new Date(relativeTo.getTime())
    // since Date constructor treats years <= 99 as 1900+
    // it can't be used, thus this weird way
    result.setFullYear(this.y, this.m, this.d)
    result.setHours(this.h, this.i, this.s, this.f)
    // note: this is done twice in PHP
    // early when processing special relatives
    // and late
    // todo: check if the logic can be reduced
    // to just one time action
    switch (this.firstOrLastDayOfMonth) {
      case 1:
        result.setDate(1)
        break
      case -1:
        result.setMonth(result.getMonth() + 1, 0)
        break
    }
    // adjust timezone
    if (!isNaN(this.z) && result.getTimezoneOffset() !== this.z) {
      result.setUTCFullYear(
        result.getFullYear(),
        result.getMonth(),
        result.getDate())
      result.setUTCHours(
        result.getHours(),
        result.getMinutes(),
        result.getSeconds() - this.z,
        result.getMilliseconds())
    }
    return result
  }
}
function strtotime (str, now) {
  //       discuss at: https://locutus.io/php/strtotime/
  //      original by: Caio Ariede (https://caioariede.com)
  //      improved by: Kevin van Zonneveld (https://kvz.io)
  //      improved by: Caio Ariede (https://caioariede.com)
  //      improved by: A. Matías Quezada (https://amatiasq.com)
  //      improved by: preuter
  //      improved by: Brett Zamir (https://brett-zamir.me)
  //      improved by: Mirko Faber
  //         input by: David
  //      bugfixed by: Wagner B. Soares
  //      bugfixed by: Artur Tchernychev
  //      bugfixed by: Stephan Bösch-Plepelits (https://github.com/plepe)
  // reimplemented by: Rafał Kukawski
  //           note 1: Examples all have a fixed timestamp to prevent
  //           note 1: tests to fail because of variable time(zones)
  //        example 1: strtotime('+1 day', 1129633200)
  //        returns 1: 1129719600
  //        example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200)
  //        returns 2: 1130425202
  //        example 3: strtotime('last month', 1129633200)
  //        returns 3: 1127041200
  //        example 4: strtotime('2009-05-04 08:30:00+00')
  //        returns 4: 1241425800
  //        example 5: strtotime('2009-05-04 08:30:00+02:00')
  //        returns 5: 1241418600
  //        example 6: strtotime('2009-05-04 08:30:00 YWT')
  //        returns 6: 1241454600
  if (now == null) {
    now = Math.floor(Date.now() / 1000)
  }
  // the rule order is important
  // if multiple rules match, the longest match wins
  // if multiple rules match the same string, the first match wins
  const rules = [
    formats.yesterday,
    formats.now,
    formats.noon,
    formats.midnightOrToday,
    formats.tomorrow,
    formats.timestamp,
    formats.firstOrLastDay,
    formats.backOrFrontOf,
    // formats.weekdayOf, // not yet implemented
    formats.timeTiny12,
    formats.timeShort12,
    formats.timeLong12,
    formats.mssqltime,
    formats.timeShort24,
    formats.timeLong24,
    formats.iso8601long,
    formats.gnuNoColon,
    formats.iso8601noColon,
    formats.americanShort,
    formats.american,
    formats.iso8601date4,
    formats.iso8601dateSlash,
    formats.dateSlash,
    formats.gnuDateShortOrIso8601date2,
    formats.gnuDateShorter,
    formats.dateFull,
    formats.pointedDate4,
    formats.pointedDate2,
    formats.dateNoDay,
    formats.dateNoDayRev,
    formats.dateTextual,
    formats.dateNoYear,
    formats.dateNoYearRev,
    formats.dateNoColon,
    formats.xmlRpc,
    formats.xmlRpcNoColon,
    formats.soap,
    formats.wddx,
    formats.exif,
    formats.pgydotd,
    formats.isoWeekDay,
    formats.pgTextShort,
    formats.pgTextReverse,
    formats.clf,
    formats.year4,
    formats.ago,
    formats.dayText,
    formats.relativeTextWeek,
    formats.relativeText,
    formats.monthFullOrMonthAbbr,
    formats.tzCorrection,
    formats.tzAbbr,
    formats.dateShortWithTimeShort12,
    formats.dateShortWithTimeLong12,
    formats.dateShortWithTimeShort,
    formats.dateShortWithTimeLong,
    formats.relative,
    formats.whitespace
  ]
  const result = Object.create(resultProto)
  while (str.length) {
    let longestMatch = null
    let finalRule = null
    for (let i = 0, l = rules.length; i < l; i++) {
      const format = rules[i]
      const match = str.match(format.regex)
      if (match) {
        if (!longestMatch || match[0].length > longestMatch[0].length) {
          longestMatch = match
          finalRule = format
        }
      }
    }
    if (!finalRule || (finalRule.callback && finalRule.callback.apply(result, longestMatch) === false)) {
      return false
    }
    str = str.substr(longestMatch[0].length)
    finalRule = null
    longestMatch = null
  }
  return Math.floor(result.toDate(new Date(now * 1000)) / 1000)
}


// src\Game.js


class Game {
	constructor({url, played, title}) {
		this.url = url;
		this.title = null;
		this.played = played;
		this.version = null;
		this.downloads = [];
		this.changelog = null;
		this.banner = null;
		this.threadDate = null;
		this.gameDate = null;
		this.cachedTitle = title;
	}




	get isNew() {
		return this.played != this.version;
	}




	save() {
		const gg = JSON.parse(localStorage.getItem('ffg-games') || '[]').filter(it=>it.url!=this.url);
		gg.push({
			url: this.url,
			played: this.played,
			title: this.title,
		});
		localStorage.setItem('ffg-games', JSON.stringify(gg));
	}




	async load() {
		const oss = ['Win', 'PC'];

		const html = await getHtml(this.url);
		const post = html.querySelector('.message-threadStarterPost .message-cell.message-cell--main .message-content .message-body .bbWrapper');
		if (!post) {
			log('!!! NO POST', this.url, html);
		} else {
			this.title = html.querySelector('.p-title-value').textContent;
			this.threadDate = new Date(strtotime(post.textContent.replace(/^.+(Thread|Post)\s+Updated?\s*:\s*([^\r\n]+)[\r\n].+$/s, '$2'))*1000);
			this.gameDate = new Date(strtotime(post.textContent.replace(/^.+(Release\s+Date|Game\s+Updated)\s*:\s*([^\r\n]+)[\r\n].+$/s, '$2'))*1000);
			this.version = post.textContent.replace(/^.+?Version\s*:\s*([^\r\n]+).+$/s, '$1');
			
			const changelogHeader = Array.from(post.querySelectorAll('b')).find(it=>it.textContent.search(/^(Changelog|Change-logs?|Changelog history):?$/i)==0);
			let changelogSpoiler = changelogHeader;
			while (changelogSpoiler && !changelogSpoiler.classList.contains('bbCodeSpoiler')) {
				changelogSpoiler = changelogSpoiler.nextElementSibling;
			}
			if (changelogSpoiler) {
				this.changelog = changelogSpoiler;
				this.changelog.querySelector('.button-text').textContent = 'Changelog';
			}
			this.banner = post.querySelector('img.bbImage');
			if (this.banner) {
				this.banner.classList.remove('lazyload');
				this.banner.classList.remove('lazyloading');
				this.banner.style.height = '75px';
				this.banner.style.width = '300px';
				this.banner.style.objectFit = 'cover';
				this.banner.style.display = 'inline-block';
				this.banner.style.verticalAlign = 'middle';
				this.banner.src = this.banner.getAttribute('data-src');
			}
			

			const bs = Array.from(post.querySelectorAll('b, a.link--external'));
			let afterDl = true;
			let afterOs = false;
			let os = null;
			let dls = [];
			bs.forEach(b=>{
				if (!afterDl && b.tagName == 'B' && b.textContent.trim().search(/\s*DOWNLOAD\s*/s) == 0) {
					afterDl = true;
				} else if (afterDl) {
					if (b.tagName == 'B' && b.textContent.trim().search(/^((Win|PC)?\s*(?:\/|-)?\s*(Lin(?:ux)?)?\s*(?:\/|-)?\s*(Mac)?\s*(?:\/|-)?\s*(Android)?)$/i) == 0) {
						os = b.textContent.trim().replace(/^((Win|PC)?\s*(?:\/|-)?\s*(Lin(?:ux)?)?\s*(?:\/|-)?\s*(Mac)?\s*(?:\/|-)?\s*(Android)?)$/i, '$1');
						if (os.split(/\/|-/).map(x=>oss.filter(it=>it.toLowerCase()==x.trim().toLowerCase()).length).filter(it=>it).length) {
							dls = [];
							this.downloads.push({
								os: os,
								links: dls
							});
							log('os:',os,dls);
						} else {
							os = null;
						}
					} else if (b.tagName == 'B') {
						os = null;
					} else if (b.tagName == 'A' && os) {
						b.style.display = 'block';
						b.style.overflow = 'hidden';
						b.style.whiteSpace = 'nowrap';
						b.style.textOverflow = 'ellipsis';
						dls.push(b);
					}
				}
			});
			log(this.threadDate, this.gameDate, this.version, changelogSpoiler, this.downloads);
			this.save();
		}
		
		
	}
}


// src\GamesMonitor.js


class GamesMonitor {
	constructor() {
		const g = JSON.parse(localStorage.getItem('ffg-games') || '[]');
		this.games = g.map(it=>new Game(it));

		this.filterBar = null;
		this.itemContainer = null;
		this.playedVersion = {};

		this.buildGui();
		this.x();
	}




	buildGui() {
		$('.p-body-header .p-title-value').textContent = 'Followed Games';
		document.title = 'Followed Games | F95zone';
		const body = $('.p-body-pageContent');
		body.innerHTML = '';

		const style = document.createElement('link'); {
			style.rel = 'stylesheet';
			style.href = 'https://f95zone.to/css.php?css=public%3ABRATR_rating_stars.less%2Cpublic%3Aandy_quicksearch.less%2Cpublic%3Aattachments.less%2Cpublic%3AavForumsTagEss_thread_view_grouped_tags.less%2Cpublic%3Abb_code.less%2Cpublic%3Aeditor.less%2Cpublic%3Alightbox.less%2Cpublic%3Amessage.less%2Cpublic%3Arating_stars.less%2Cpublic%3Arellect_favicon.less%2Cpublic%3Asiropu_ads_manager_ad.less%2Cpublic%3Astructured_list.less%2Cpublic%3AsvESE_macros_similar_contents.less%2Cpublic%3AsvLazyImageLoader.less%2Cpublic%3AtckPatreonSync_message_macros.less%2Cpublic%3Ath_covers.less%2Cpublic%3Ath_uix_threadStarterPost.less%2Cpublic%3Auix_extendedFooter.less%2Cpublic%3Auix_socialMedia.less%2Cpublic%3Aextra.less&s=26&l=1&d=1603141514&k=1b4aed3376c435ce875a293c0046d031c0ec5b94';
			document.body.appendChild(style);
		}

		const container = document.createElement('div'); {
			container.classList.add('block-container');
			const filterBar = document.createElement('div'); {
				this.filterBar = filterBar;
				filterBar.classList.add('block-filterBar');
				filterBar.textContent = 'LOADING ...';
				container.appendChild(filterBar);
			}
			const itemContainer = document.createElement('div'); {
				this.itemContainer = itemContainer;
				itemContainer.classList.add('structItemContainer');
				container.appendChild(itemContainer);
			}
			body.appendChild(container);
		}
	}




	async x() {
		await Promise.all(this.games.map(it=>it.load()));
		this.games.sort((a,b)=>{
			if (!a.isNew && b.isNew) return 1;
			if (a.isNew && !b.isNew) return -1;
			if (a.threadDate < b.threadDate) return 1;
			if (a.threadDate > b.threadDate) return -1;
			return 0;
		});
		this.filterBar.innerHTML = '';
		this.games.filter(game=>!game.title).forEach(game=>{
			const item = document.createElement('div'); {
				item.classList.add('structItem');
				item.style.display = 'table-row';
				const main = document.createElement('div'); {
					main.classList.add('structItem-cell');
					main.classList.add('structItem-cell--main');
					main.style.width = '100%';
					main.textContent = 'GAME MISSING:  ' + game.cachedTitle;
					const a = document.createElement('a'); {
						a.textContent = game.url;
						a.href = game.url;
						a.style.display = 'block';
						main.append(a);
					}
					const unfollow = document.createElement('button'); {
						unfollow.classList.add('bbCodeSpoiler-button');
						unfollow.classList.add('button');
						unfollow.addEventListener('click', evt=>{
							item.remove();
							let games = JSON.parse(localStorage.getItem('ffg-games') || '[]');
							games = games.filter(it=>it.url != game.url);
							localStorage.setItem('ffg-games', JSON.stringify(games));
						});
						const span = document.createElement('span'); {
							span.classList.add('button-text');
							span.textContent = 'Unfollow';
							unfollow.appendChild(span);
						}
						main.append(unfollow);
					}
					item.append(main);
				}
				const meta = document.createElement('div'); {
					meta.classList.add('structItem-cell');
					meta.classList.add('structItem-cell--meta');
					meta.style.width = '200px';
					item.append(meta);
				}
				const downloads = document.createElement('div'); {
					downloads.classList.add('structItem-cell');
					downloads.classList.add('structItem-cell--meta');
					item.append(downloads);
				}
				this.itemContainer.append(item);
			}
		});
		this.games.filter(game=>game.title).forEach(game=>{
			const item = document.createElement('div'); {
				item.classList.add('structItem');
				item.style.display = 'table-row';
				if (!game.isNew) {
					item.style.opacity = '0.5';
				}
				const main = document.createElement('div'); {
					main.classList.add('structItem-cell');
					main.classList.add('structItem-cell--main');
					main.style.width = '100%';
					const title = document.createElement('div'); {
						title.classList.add('structItem-title');
						title.appendChild(game.banner);
						const link = document.createElement('a'); {
							link.textContent = game.title;
							link.href = game.url;
							link.style.display = 'inline-block';
							link.style.verticalAlign = 'middle';
							link.style.marginLeft = '10px';
							title.appendChild(link);
						}
						const played = document.createElement('button'); {
							played.classList.add('bbCodeSpoiler-button');
							played.classList.add('button');
							played.addEventListener('click', evt=>{
								this.playedVersion[game.url].textContent = game.version;
								game.played = game.version;
								item.style.opacity = '0.5';
								game.save();
							});
							const span = document.createElement('span'); {
								span.classList.add('button-text');
								span.textContent = 'Played this version';
								played.appendChild(span);
							}
						}
						const unfollow = document.createElement('button'); {
							unfollow.classList.add('bbCodeSpoiler-button');
							unfollow.classList.add('button');
							unfollow.addEventListener('click', evt=>{
								item.remove();
								let games = JSON.parse(localStorage.getItem('ffg-games') || '[]');
								games = games.filter(it=>it.url != game.url);
								localStorage.setItem('ffg-games', JSON.stringify(games));
							});
							const span = document.createElement('span'); {
								span.classList.add('button-text');
								span.textContent = 'Unfollow';
								unfollow.appendChild(span);
							}
						}
						if (game.changelog) {
							title.appendChild(game.changelog);
							game.changelog.insertBefore(played, game.changelog.children[0]);
							game.changelog.insertBefore(unfollow, game.changelog.children[1]);
						} else {
							title.appendChild(played);
							title.appendChild(unfollow);
						}
						main.appendChild(title);
					}
					item.appendChild(main);
				}
				const meta = document.createElement('div'); {
					meta.classList.add('structItem-cell');
					meta.classList.add('structItem-cell--meta');
					meta.style.width = '200px';
					const version = document.createElement('dl'); {
						version.classList.add('pairs');
						version.classList.add('pairs--justified');
						const dt = document.createElement('dt'); {
							dt.textContent = 'Version';
							version.appendChild(dt);
						}
						const dd = document.createElement('dd'); {
							dd.textContent = game.version;
							version.appendChild(dd);
						}
						meta.appendChild(version);
					}
					const latestPlayed = document.createElement('dl'); {
						latestPlayed.classList.add('pairs');
						latestPlayed.classList.add('pairs--justified');
						const dt = document.createElement('dt'); {
							dt.textContent = 'Played';
							latestPlayed.appendChild(dt);
						}
						const dd = document.createElement('dd'); {
							this.playedVersion[game.url] = dd;
							if (game.played) {
								dd.textContent = game.played;
							}
							latestPlayed.appendChild(dd);
						}
						meta.appendChild(latestPlayed);
					}
					const threadDate = document.createElement('dl'); {
						threadDate.classList.add('pairs');
						threadDate.classList.add('pairs--justified');
						const dt = document.createElement('dt'); {
							dt.textContent = 'Thread';
							threadDate.appendChild(dt);
						}
						const dd = document.createElement('dd'); {
							dd.textContent = `${game.threadDate.getFullYear()}-${game.threadDate.getMonth()<9?'0':''}${game.threadDate.getMonth()+1}-${game.threadDate.getDate()<10?'0':''}${game.threadDate.getDate()}`;
							threadDate.appendChild(dd);
						}
						meta.appendChild(threadDate);
					}
					const gameDate = document.createElement('dl'); {
						gameDate.classList.add('pairs');
						gameDate.classList.add('pairs--justified');
						const dt = document.createElement('dt'); {
							dt.textContent = 'Game';
							gameDate.appendChild(dt);
						}
						const dd = document.createElement('dd'); {
							dd.textContent = `${game.gameDate.getFullYear()}-${game.gameDate.getMonth()<9?'0':''}${game.gameDate.getMonth()+1}-${game.gameDate.getDate()<10?'0':''}${game.gameDate.getDate()}`;
							gameDate.appendChild(dd);
						}
						meta.appendChild(gameDate);
					}
					item.appendChild(meta);
				}
				const downloads = document.createElement('div'); {
					downloads.classList.add('structItem-cell');
					downloads.classList.add('structItem-cell--meta');
					game.downloads.forEach(dl=>{
						const cont = document.createElement('dl'); {
							cont.classList.add('pairs');
							const dt = document.createElement('dt'); {
								dt.textContent = dl.os;
								cont.appendChild(dt);
							}
							const dd = document.createElement('dd'); {
								dl.links.forEach(it=>dd.appendChild(it));
								cont.appendChild(dd);
							}
							downloads.appendChild(cont);
						}
					});
					item.appendChild(downloads);
				}
				this.itemContainer.appendChild(item);
			}
		});
	}
}
// ---------------- /IMPORTS ----------------





	const latest = $('[data-nav-id="LatestUpdates"]')?.closest('li');
	if (latest) {
		const navLink = latest.cloneNode(true); {
			$(navLink, 'a').href = '/followed-games';
			$(navLink, 'a > span').textContent = 'Followed Games';
			latest.insertAdjacentElement('afterEnd', navLink);
		}
		$$('.p-navEl-link[target="_blank"]').forEach(it=>it.closest('li').remove());
		if (location.href == 'https://f95zone.to/followed-games') {
			$(navLink, '.p-navEl').classList.add('is-selected');
			const app = new GamesMonitor();
		} else if (location.href.search(/(https:\/\/f95zone.to\/threads\/)[^\/]+(\.\d+\/)/) == 0) {
			log('add btn');
			const watch = $('[data-sk-watch]');
			if (watch) {
				log('yup');
				const url = location.href.replace(/(https:\/\/f95zone.to\/threads\/)[^\/]+(\.\d+\/).*$/, '$1$2');
				let games = JSON.parse(localStorage.getItem('ffg-games') || '[]');
				let followed = false;
				if (games.filter(it=>it.url==url).length) {
					followed = true;
				}
				const btn = document.createElement('a'); {
					btn.classList.add('button--link');
					btn.classList.add('button');
					btn.classList.add('rippleButton');
					btn.href = './follow';
					btn.addEventListener('click', evt=>{
						evt.preventDefault();
						if (followed) {
							games = games.filter(it=>it.url != url);
							span.textContent = 'Follow';
						} else {
							games.push({url:url});
							span.textContent = 'Unfollow';
						}
						localStorage.setItem('ffg-games', JSON.stringify(games));
						followed = !followed;
					});
					const span = document.createElement('span'); {
						span.classList.add('button-text');
						span.textContent = followed ? 'Unfollow' : 'Follow';
						btn.appendChild(span);
					}
					const rip = document.createElement('div'); {
						rip.classList.add('ripple-container');
						btn.appendChild(rip);
					}
					watch.parentElement.appendChild(btn);
				}
			}
		}
	} else {
		const template = $('.p-navEl:not(.is-selected) > [data-nav-id]')?.closest('li');
		const navLink = template.cloneNode(true); {
			$(navLink, 'a').href = 'https://f95zone.to/followed-games';
			$(navLink, 'a > span').textContent = 'Followed Games';
			template.closest('ul').append(navLink);
		}
	}
})();