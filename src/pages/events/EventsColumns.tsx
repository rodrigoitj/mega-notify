import React from 'react';
import { Tag, TimePicker } from 'antd';
import { dayOfWeekAsString } from '../../utils/calendarHelpers';
import { Dayjs } from 'dayjs';
function getEventColumns(
  eventDetails,
  notificationStarted,
  onChangeCallback,
) {
  const columns = [
    {
      title: 'Evento',
      dataIndex: 'evento',
      onCell: () => {
        return {
          style: {
            whiteSpace: 'nowrap',
            maxWidth: 180,
          },
        };
      },
      render: (text: string) =>
        Object.prototype.hasOwnProperty.call(eventDetails, text) ? (
          <a
            href={eventDetails[text]}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        ) : (
          text
        ),
    },
    {
      title: 'Horários',
      dataIndex: 'horarios',
      render: (times, row) => {
        return (
          <p>
            {row.diasSemana.length === 0 &&
              times.map((time: any, index: any) => (
                <Tag color="blue" key={`t${time}_${index}`}>
                  {time}
                </Tag>
              ))}
            <br />
            {row.diasSemana &&
              row.diasSemana.map(
                (numeroDia: number, index: string | number) => (
                  <Tag color="green" key={`s${numeroDia}_${index}`}>
                    {dayOfWeekAsString(numeroDia)} {times[index]}
                  </Tag>
                ),
              )}
          </p>
        );
      },
    },
    {
      title: 'Primeiro alerta (mm:ss)',
      dataIndex: 'primeiro',
      render: (alerta: Dayjs, row: any, index: string | number) => {
        return (
          <TimePicker
            defaultValue={alerta && alerta.isValid() ? alerta : null}
            value={alerta && alerta.isValid() ? alerta : null}
            format="mm:ss"
            onChange={onChangeCallback('primeiro', row, index)}
            secondStep={10}
            style={{ minWidth: 90 }}
            disabled={notificationStarted}
          />
        );
      },
    },
    {
      title: 'Segundo alerta (mm:ss)',
      dataIndex: 'segundo',
      render: (alerta: Dayjs, row: any, index: string | number) => {
        return (
          <TimePicker
            defaultValue={alerta && alerta.isValid() ? alerta : null}
            value={alerta && alerta.isValid() ? alerta : null}
            format="mm:ss"
            onChange={onChangeCallback('segundo', row, index)}
            secondStep={10}
            style={{ minWidth: 90 }}
            disabled={notificationStarted}
          />
        );
      },
    },
  ];
  return columns;
}
export default getEventColumns;
