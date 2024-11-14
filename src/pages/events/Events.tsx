import React, { useEffect, useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import logo from '../../assets/logo.png';
import useInterval from 'use-interval-hook';
import {
  Table,
  Tag,
  Layout,
  Menu,
  Breadcrumb,
  Alert,
  Row,
  Col,
  Affix,
  Progress,
} from 'antd';
import {
  PlaySquareOutlined,
  FieldTimeOutlined,
  PauseOutlined,
  RestOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import Countdown from 'react-countdown';
import moment from 'moment';
import load from 'load-script';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  setStorageAlerts,
  getConfig,
} from '../../services/storageService';
import eventDetails from '../../constants/eventDetails.js';
import { siteTitle } from '../../state/GlobalState.js';
import getEventColumns from './EventsColumns';
import { openWindowNotificationWithIcon } from '../../utils/notificationWindow';
import {
  buildEventSchedules,
  parseNotificationEventSchedules,
} from './scheduleHelpers';
import { calcPercentage } from '../../utils/mathHelpers';
import { shortHumanizer } from '../../utils/stringHelpers';
import { TextWithLimit } from '../../utils/componentHelpers';
import configDefaults from '../../constants/configDefaults';
import dayjs from 'dayjs';

declare global {
  interface Window {
    eventsTime: any[];
    eventsTime2: any[];
  }
}

const { Content } = Layout;

const scrollToRef = (ref: React.MutableRefObject<any>) =>
  window.scrollTo(0, ref.current.offsetTop);
const eventQueueSize = 6;

function Events(props: { pageTitle: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [eventState, setEventState] = useState({
    eventsSchedules: [],
    notificationStarted: false,
    timeOffset: getConfig('timeOffset', configDefaults['timeOffset']),
    initializedDate: null,
    parsedNotificationSchedules: [],
  });
  const {
    eventsSchedules,
    notificationStarted,
    timeOffset,
    initializedDate,
    parsedNotificationSchedules,
  } = eventState;

  const contentOptionsBarRef = useRef(null);
  const executeScroll = () => scrollToRef(contentOptionsBarRef);

  const handleAlertChange =
    (tipo: string, _row: any, index: string | number) =>
    (momentObj: any) => {
      const events = [...eventsSchedules];
      events[index][tipo] = momentObj;
      persistEventSchedules(events);
    };
  const eventColumns = getEventColumns(
    eventDetails,
    notificationStarted,
    handleAlertChange,
  );

  function toggleNotificacoes() {
    return !notificationStarted
      ? iniciarNotificacoes()
      : pararNotificacoes();
  }

  function iniciarNotificacoes() {
    executeScroll();
    Notification.requestPermission(function (permission) {
      if (permission === 'denied') {
        openWindowNotificationWithIcon(
          'error',
          'Permissão de notificações',
          'Você não permitiu as notificações desktop',
        );
        return;
      }
      const notificationEventSchedules =
        parseNotificationEventSchedules(eventsSchedules, timeOffset);
      setEventState({
        ...eventState,
        parsedNotificationSchedules: notificationEventSchedules,
        notificationStarted: true,
        initializedDate: Date.now(),
      });
      activate();
    });
  }

  function pararNotificacoes() {
    // if (Notification.permission === 'granted') {
    //   new Notification(siteTitle.get(), {
    //     body: 'Você parou de receber notificações',
    //     icon: logo,
    //     tag: 'event-stop',
    //   });
    // }
    setEventState({ ...eventState, notificationStarted: false });
    stop();
  }

  function restaurarPadrao() {
    const defaultNotificationTime = getConfig(
      'defaultNotificationTime',
      configDefaults['defaultNotificationTime'],
    );
    const newSchedules = eventsSchedules.map((schedule) => {
      schedule.primeiro = dayjs(defaultNotificationTime);
      schedule.segundo = null;
      return schedule;
    });
    persistEventSchedules(newSchedules);
  }

  function limparTodos() {
    const newSchedules = eventsSchedules.map((schedule) => {
      schedule.primeiro = null;
      schedule.segundo = null;
      return schedule;
    });
    persistEventSchedules(newSchedules);
  }

  function persistEventSchedules(eventsTime: any[]) {
    setEventState({ ...eventState, eventsSchedules: eventsTime });
    setStorageAlerts(eventsTime);
  }

  function showHumanized(time: string) {
    let total = 0;
    if (time && time.toString().includes(':')) {
      const [minute, seconds] = time.toString().split(':');
      total = parseFloat(minute) * 60 + parseFloat(seconds);
    } else {
      total = parseFloat(time);
    }
    // return total.toString();
    return shortHumanizer(total * 1000, {
      spacer: '',
      delimiter: ':',
    });
  }
  const executeScheduledEvents = () => {
    const schedules = [...parsedNotificationSchedules];
    const initialLength = schedules.length;
    for (const key in schedules) {
      const element = parsedNotificationSchedules[key];
      const now = new Date();
      const [evento, horarioNotificacao, minutos] = element;

      if (horarioNotificacao <= now) {
        schedules.shift();
        const desktopNotification = new Notification(
          siteTitle.get(),
          {
            body: `${evento} em ${showHumanized(minutos)}`,
            icon: logo,
            // tag: `event ${evento}`,
          },
        );
        if (
          Object.prototype.hasOwnProperty.call(eventDetails, evento)
        ) {
          desktopNotification.addEventListener('click', (event) => {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            window.open(eventDetails[evento], '_blank');
          });
        }
      } else break;
    }

    if (
      schedules.length < initialLength &&
      schedules.length > eventQueueSize
    ) {
      setEventState({
        ...eventState,
        parsedNotificationSchedules: schedules,
      });
    } else if (schedules.length <= eventQueueSize) {
      const notificationEventSchedules =
        parseNotificationEventSchedules(eventsSchedules, timeOffset);
      setEventState({
        ...eventState,
        parsedNotificationSchedules: notificationEventSchedules,
      });
    }
  };
  const { activate, stop, isPaused } = useInterval({
    interval: 5000,
    callback: executeScheduledEvents,
    delay: 0,
  });
  !notificationStarted && !isPaused && stop();

  useEffect(() => {
    setIsLoading(eventsSchedules.length === 0);
    return () => {};
  }, [eventsSchedules]);

  useEffect(() => {
    load('https://megamu.net/events.js', function (err) {
      if (err) {
        openWindowNotificationWithIcon(
          'error',
          'Erro ao carregar o tempo dos eventos',
          'Não foi possível carregar o tempo dos eventos',
        );
        return;
      }
      window.eventsTime = window.eventsTime.concat(
        window.eventsTime2,
      );
      const builtEventsSchedules = buildEventSchedules(
        window.eventsTime,
      );
      // console.log(window.eventsTime);
      persistEventSchedules(builtEventsSchedules);
    });

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextEvents = useMemo(
    () => parsedNotificationSchedules.slice(0, eventQueueSize),
    [parsedNotificationSchedules],
  );
  const breadCrumbItems = [
    {
      title: siteTitle.get(),
    },
    {
      title: props.pageTitle,
    },
  ];
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{`${siteTitle.get()} - ${props.pageTitle}`}</title>
          <meta name="description" content={props.pageTitle} />
        </Helmet>
      </HelmetProvider>
      <Breadcrumb
        style={{ margin: '16px 0' }}
        items={breadCrumbItems}
      />
      <Content className="site-content-background">
        <div className="contentOptionsBar" ref={contentOptionsBarRef}>
          <Affix offsetTop={0}>
            <Menu
              mode="horizontal"
              selectable={false}
              style={{ height: '100%', borderRight: 0 }}
              items={[
                {
                  label: !notificationStarted ? 'Iniciar' : 'Parar',
                  key: '1',
                  icon: notificationStarted ? (
                    <PauseOutlined />
                  ) : (
                    <PlaySquareOutlined />
                  ),
                  onClick: toggleNotificacoes,
                },
                {
                  label: 'Opções',
                  key: '2',
                  icon: <ControlOutlined />,

                  children: [
                    {
                      label: 'Restaurar padrão',
                      key: '3',
                      icon: <FieldTimeOutlined />,
                      onClick: restaurarPadrao,
                    },
                    {
                      label: 'Limpar todos',
                      key: '4',
                      icon: <RestOutlined />,
                      onClick: limparTodos,
                    },
                  ],
                },
              ]}
            />
          </Affix>
        </div>
        {notificationStarted && (
          <div className="nextEvent">
            <Row gutter={10}>
              {nextEvents.map((nextEvent, index) => {
                const cdKey = `${
                  nextEvent[0]
                }-${nextEvent[1].toString()}`;
                const momentEventDate = moment(nextEvent[1]);
                const momentInitializedDate = moment(initializedDate);
                const secondsToEvent = momentEventDate.diff(
                  momentInitializedDate,
                  'seconds',
                );
                return (
                  <Col span={4} key={index}>
                    <Alert
                      message={
                        !Object.prototype.hasOwnProperty.call(
                          eventDetails,
                          nextEvent[0],
                        ) ? (
                          <TextWithLimit text={nextEvent[0]} />
                        ) : (
                          <a
                            href={eventDetails[nextEvent[0]]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <TextWithLimit text={nextEvent[0]} />
                          </a>
                        )
                      }
                      description={
                        <Countdown
                          key={cdKey}
                          date={nextEvent[1]}
                          intervalDelay={1000}
                          precision={3}
                          renderer={({
                            // hours,
                            // minutes,
                            // seconds,
                            total,
                            completed,
                          }) => (
                            <div>
                              {!completed && (
                                <Tag color="blue">
                                  {showHumanized(
                                    Math.round(
                                      total / 1000,
                                    ).toString(),
                                  )}
                                </Tag>
                              )}
                              <br />
                              <Progress
                                percent={
                                  !completed
                                    ? calcPercentage(
                                        total,
                                        secondsToEvent,
                                      )
                                    : 100
                                }
                                size="small"
                                status="active"
                                showInfo={false}
                              />
                            </div>
                          )}
                        />
                      }
                      type={index === 0 ? 'success' : 'warning'}
                    />
                  </Col>
                );
              })}
            </Row>
          </div>
        )}
        <Table
          loading={isLoading}
          className="event-list"
          columns={eventColumns}
          dataSource={eventsSchedules}
          pagination={false}
        />
      </Content>
    </>
  );
}
Events.propTypes = {
  pageTitle: PropTypes.any.isRequired,
};
export default Events;
