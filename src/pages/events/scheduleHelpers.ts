import { sortBy } from 'lodash';
import moment from 'moment';
import { getStorageAlerts } from '../../services/storageService';

function buildEventSchedules(data) {
  const fromStorage = getStorageAlerts();
  //console.table(fromStorage);
  return data
    .map(function (
      event: string | any[],
      index: { toString: () => any },
    ) {
      const time = event.length === 3 ? event[2] : event[1];
      const weekDays = event.length === 3 ? event[1] : [];
      const storedEvent = fromStorage
        .filter((p) => p.evento === event[0])
        .shift();
      return {
        key: index.toString(),
        selected: true,
        evento: event[0],
        horarios: time,
        diasSemana: weekDays,
        primeiro:
          storedEvent && storedEvent.primeiro !== undefined
            ? moment(storedEvent.primeiro, 'YYYY-MM-DDTHH:mm:ssZ')
            : moment('05:00', 'mm:ss'), // em segundos //moment("05:00", "mm:ss")
        segundo:
          storedEvent && storedEvent.primeiro !== undefined
            ? moment(storedEvent.segundo, 'YYYY-MM-DDTHH:mm:ssZ')
            : null, // em segundos
      };
    })
    .filter((event) => Array.isArray(event.horarios));
}

function parseFinalNotificationSchedules(
  now: Date,
  hmEvento: { split: (arg0: string) => [any, any] },
  diaSemana: number,
  horarioAlertaAntecipado: {
    format: (arg0: string) => {
      (): any;
      new (): any;
      split: { (arg0: string): [any, any]; new (): any };
    };
  },
  timeOffset: number,
) {
  const [minutos, segundos] = horarioAlertaAntecipado
    .format('mm:ss')
    .split(':');
  const [horaEvento, minutosEvento] = hmEvento.split(':');
  const eventTime = parseInt(`${horaEvento}${minutosEvento}`);
  const timeNow = parseInt(`${now.getHours()}${now.getMinutes()}`);
  const day =
    eventTime >= timeNow ? now.getDate() : now.getDate() + 1;

  const horarioEvento = new Date(
    now.getFullYear(),
    now.getMonth(),
    day,
    horaEvento,
    minutosEvento,
  );

  const eventWeekDay = horarioEvento.getDay() + 1;
  if (diaSemana !== undefined && diaSemana !== eventWeekDay)
    return null;
  const segundosDiminuir =
    parseInt(minutos) * 60 + parseInt(segundos) + timeOffset;
  const finalDate = moment(horarioEvento)
    .subtract(segundosDiminuir, 'seconds')
    .toDate();
  return finalDate;
}

/**
 * @param {string | any[]} schedules
 */
function parseNotificationEventSchedules(
  schedules: string | any[],
  timeOffset: number,
) {
  const parsedSchedules = [];
  for (let index = 0; index < schedules.length; index++) {
    const event = schedules[index];
    for (const element in event.horarios) {
      const evento = event.evento;
      const hora = event.horarios[element];
      const now = new Date();
      if (event.primeiro !== null && event.primeiro.isValid()) {
        const primeiro = parseFinalNotificationSchedules(
          now,
          hora,
          event.diasSemana[element],
          event.primeiro,
          timeOffset,
        );
        if (primeiro !== null && primeiro >= now)
          parsedSchedules.push([
            evento,
            primeiro,
            event.primeiro.format('mm:ss'),
          ]);
      }
      if (event.segundo !== null && event.segundo.isValid()) {
        const segundo = parseFinalNotificationSchedules(
          now,
          hora,
          event.diasSemana[element],
          event.segundo,
          timeOffset,
        );
        if (segundo !== null && segundo >= now)
          parsedSchedules.push([
            evento,
            segundo,
            event.segundo.format('mm:ss'),
          ]);
      }
    }
  }
  return sortBy(parsedSchedules, (item) => item[1]);
}

export { buildEventSchedules, parseNotificationEventSchedules };
