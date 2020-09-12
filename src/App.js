import React, { useEffect, useState, useMemo } from "react";
import logo from "./logo.png";
import {
  notification,
  Table,
  Tag,
  TimePicker,
  Layout,
  Menu,
  Breadcrumb,
  Alert,
  Row,
  Col,
} from "antd";
import {
  NotificationOutlined,
  PlaySquareOutlined,
  FieldTimeOutlined,
  PauseOutlined,
  SettingOutlined,
  RestOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import Countdown from "react-countdown";
import moment from "moment";
import "./App.less";
import load from "load-script";
import { Helmet } from "react-helmet";
import { setStorageAlerts, getStorageAlerts } from "./alertsStorage";
import { getConfig } from "./configStorage";
import { sortBy } from "lodash";
import { useInterval } from "@react-corekit/use-interval";
import eventDetails from "./eventDetails";
//const { MenuItem } = Menu;
const { Header, Content, Sider } = Layout;

function App() {
  const configDefaults = {
    timeOffset: 90,
  };
  const [siteTitle] = useState("MEGA Notify");
  const [eventsSchedules, setEventsSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationStarted, setNotificationStarted] = useState(false);
  const [timeOffset] = useState(
    getConfig("timeOffset", configDefaults["timeOffset"])
  );
  const [
    parsedNotificationSchedules,
    setParsedNotificationSchedules,
  ] = useState([]);

  const handleAlertChange = (tipo, row, index) => (momentObj) => {
    const events = [...eventsSchedules];
    events[index][tipo] = momentObj;
    // setEventsSchedules(events);
    // setStorageAlerts(events);
    persistEventSchedules(events);
  };

  function dayOfWeekAsString(dayIndex) {
    return (
      ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"][dayIndex - 1] || ""
    );
  }

  const columns = [
    {
      title: "Evento",
      dataIndex: "evento",
      onCell: () => {
        return {
          style: {
            whiteSpace: "nowrap",
            maxWidth: 180,
          },
        };
      },
      render: (text, row) =>
        eventDetails.hasOwnProperty(text) ? (
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
      title: "Horários",
      dataIndex: "horarios",
      render: (times, row, index) => {
        return (
          <p>
            {row.diasSemana.length === 0 &&
              times.map((time, index) => (
                <Tag color="blue" key={`t${time}_${index}`}>
                  {time}
                </Tag>
              ))}
            <br />
            {row.diasSemana &&
              row.diasSemana.map((numeroDia, index) => (
                <Tag color="green" key={`s${numeroDia}_${index}`}>
                  {dayOfWeekAsString(numeroDia)} {times[index]}
                </Tag>
              ))}
          </p>
        );
      },
    },
    {
      title: "Primeiro alerta (mm:ss)",
      dataIndex: "primeiro",
      render: (alerta, row, index) => {
        //console.log(alerta, index);
        return (
          <TimePicker
            defaultValue={alerta && alerta.isValid() ? alerta : null}
            value={alerta && alerta.isValid() ? alerta : null}
            format="mm:ss"
            onChange={handleAlertChange("primeiro", row, index)}
            secondStep={10}
            style={{ minWidth: 90 }}
            disabled={notificationStarted}
          />
        );
      },
    },
    {
      title: "Segundo alerta (mm:ss)",
      dataIndex: "segundo",
      render: (alerta, row, index) => {
        return (
          <TimePicker
            defaultValue={alerta && alerta.isValid() ? alerta : null}
            value={alerta && alerta.isValid() ? alerta : null}
            format="mm:ss"
            onChange={handleAlertChange("segundo", row, index)}
            secondStep={10}
            style={{ minWidth: 90 }}
            disabled={notificationStarted}
          />
        );
      },
    },
  ];

  function openWindowNotificationWithIcon(type, message, description) {
    notification[type]({
      message: message,
      description: description,
    });
  }

  function buildEventSchedules(data) {
    const fromStorage = getStorageAlerts();
    //console.table(fromStorage);
    return data
      .map(function (event, index) {
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
              ? moment(storedEvent.primeiro, "YYYY-MM-DDTHH:mm:ssZ")
              : moment("05:00", "mm:ss"), // em segundos //moment("05:00", "mm:ss")
          segundo:
            storedEvent && storedEvent.primeiro !== undefined
              ? moment(storedEvent.segundo, "YYYY-MM-DDTHH:mm:ssZ")
              : null, // em segundos
        };
      })
      .filter((event) => Array.isArray(event.horarios));
  }

  function parseFinalNotificationSchedules(
    now,
    hmEvento,
    diaSemana,
    horarioAlertaAntecipado
  ) {
    const [minutos, segundos] = horarioAlertaAntecipado
      .format("mm:ss")
      .split(":");
    const [horaEvento, minutosEvento] = hmEvento.split(":");
    const eventTime = parseInt(`${horaEvento}${minutosEvento}`);
    const timeNow = parseInt(`${now.getHours()}${now.getMinutes()}`);
    const day = eventTime >= timeNow ? now.getDate() : now.getDate() + 1;

    var horarioEvento = new Date(
      now.getFullYear(),
      now.getMonth(),
      day,
      horaEvento,
      minutosEvento
    );

    var eventWeekDay = horarioEvento.getDay() + 1;
    if (diaSemana !== undefined && diaSemana !== eventWeekDay) return null;
    const segundosDiminuir =
      parseInt(minutos) * 60 + parseInt(segundos) + timeOffset;
    const finalDate = moment(horarioEvento).subtract(
      segundosDiminuir,
      "seconds"
    )._d;
    return finalDate; //.add(642, "seconds");
  }

  function parseNotificationEventSchedules(schedules) {
    let parsedSchedules = [];
    for (let index = 0; index < schedules.length; index++) {
      const event = schedules[index];
      for (const element in event.horarios) {
        const evento = event.evento;
        const hora = event.horarios[element];
        var now = new Date();
        if (event.primeiro !== null && event.primeiro.isValid()) {
          const primeiro = parseFinalNotificationSchedules(
            now,
            hora,
            event.diasSemana[element],
            event.primeiro
          );
          if (primeiro !== null && primeiro >= now)
            parsedSchedules.push([
              evento,
              primeiro,
              event.primeiro.format("mm:ss"),
            ]);
        }
        if (event.segundo !== null && event.segundo.isValid()) {
          const segundo = parseFinalNotificationSchedules(
            now,
            hora,
            event.diasSemana[element],
            event.segundo
          );
          if (segundo !== null && segundo >= now)
            parsedSchedules.push([
              evento,
              segundo,
              event.segundo.format("mm:ss"),
            ]);
        }
      }
    }
    return sortBy(parsedSchedules, (item) => item[1]);
  }

  function toggleNotificacoes() {
    return !notificationStarted ? iniciarNotificacoes() : pararNotificacoes();
  }

  function iniciarNotificacoes() {
    Notification.requestPermission(function (permission) {
      if (permission === "denied") {
        openWindowNotificationWithIcon(
          "error",
          "Permissão de notificações",
          "Você não permitiu as notificações desktop"
        );
        return;
      }
      const notificationEventSchedules = parseNotificationEventSchedules(
        eventsSchedules
      );
      //console.table(notificationEventSchedules);
      setParsedNotificationSchedules(notificationEventSchedules);
      setNotificationStarted(true);
    });
  }

  function pararNotificacoes() {
    if (Notification.permission === "granted") {
      new Notification(siteTitle, {
        body: "Você parou de receber notificações",
        icon: logo,
        tag: "event-stop",
      });
    }
    setNotificationStarted(false);
  }

  function restaurarPadrao() {
    const newSchedules = eventsSchedules.map((schedule) => {
      schedule.primeiro = moment("05:00", "mm:ss");
      schedule.segundo = null;
      return schedule;
    });
    //console.log("restaurarPadrao", newSchedules);
    persistEventSchedules(newSchedules);
  }
  function limparTodos() {
    const newSchedules = eventsSchedules.map((schedule) => {
      schedule.primeiro = null;
      schedule.segundo = null;
      return schedule;
    });
    //console.log("limparTodos", newSchedules);
    persistEventSchedules(newSchedules);
  }
  function persistEventSchedules(eventsTime) {
    setEventsSchedules(eventsTime);
    setStorageAlerts(eventsTime);
  }

  useInterval(
    () => {
      //console.log("parsedNotificationSchedules", parsedNotificationSchedules);
      const schedules = [...parsedNotificationSchedules];
      const initialLength = schedules.length;
      for (const key in schedules) {
        const element = parsedNotificationSchedules[key];
        const now = new Date();
        const [evento, horarioNotificacao, minutos] = element;

        if (horarioNotificacao <= now) {
          schedules.shift();
          const notification = new Notification(siteTitle, {
            body: `${evento} em ${minutos}`,
            icon: logo,
            // tag: `event ${evento}`,
          });
          if (eventDetails.hasOwnProperty(evento)) {
            notification.addEventListener("click", (event) => {
              event.preventDefault(); // prevent the browser from focusing the Notification's tab
              window.open(eventDetails[evento], "_blank");
            });
          }
        } else break;
      }

      if (schedules.length < initialLength && schedules.length > 3) {
        console.table(schedules);
        setParsedNotificationSchedules(schedules);
      } else if (schedules.length <= 3) {
        const notificationEventSchedules = parseNotificationEventSchedules(
          eventsSchedules
        );
        console.table(notificationEventSchedules);
        setParsedNotificationSchedules(notificationEventSchedules);
      }
    },
    notificationStarted ? 5000 : null
  );

  useEffect(() => {
    setIsLoading(eventsSchedules.length === 0);
    return () => {};
  }, [eventsSchedules]);

  useEffect(() => {
    load("https://megamu.net/events.js", function (err, script) {
      if (err) {
        openWindowNotificationWithIcon(
          "error",
          "Erro ao carregar o tempo dos eventos",
          "Não foi possível carregar o tempo dos eventos"
        );
      } else {
        var builtEventsSchedules = buildEventSchedules(window.eventsTime);
        persistEventSchedules(builtEventsSchedules);
      }
    });
    return () => {};
  }, []);

  const nextEvents = useMemo(() => {
    return parsedNotificationSchedules.slice(0, 3);
  }, [parsedNotificationSchedules]);

  return (
    <Layout>
      <Header style={{ backgroundColor: "#001529" }}>
        <Helmet>
          <title>{siteTitle}</title>
          <meta name="description" content={siteTitle} />
        </Helmet>
        <div className="logo">{siteTitle}</div>
        <Menu mode="horizontal" theme="dark" style={{ float: "right" }}>
          <Menu.Item key="1">
            <a
              href="http://megamu.net/py0y"
              target="_blank"
              rel="noopener noreferrer"
            >
              MEGAMU
            </a>
          </Menu.Item>
        </Menu>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            // defaultOpenKeys={["sub1"]}
            style={{ height: "100%", borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<NotificationOutlined />}>
              Notificações
            </Menu.Item>
            <Menu.Item
              key="2"
              icon={<SettingOutlined />}
              disabled={true}
              title="Em Breve"
            >
              Configurações
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Notificações</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <div className="contentOptionsBar">
              <Menu
                mode="horizontal"
                selectable={false}
                style={{ height: "100%", borderRight: 0 }}
              >
                <Menu.Item
                  key="1"
                  onClick={toggleNotificacoes}
                  icon={
                    notificationStarted ? (
                      <PauseOutlined />
                    ) : (
                      <PlaySquareOutlined />
                    )
                  }
                >
                  {!notificationStarted ? "Iniciar" : "Parar"}
                </Menu.Item>
                <Menu.SubMenu
                  title="Opções"
                  icon={<ControlOutlined />}
                  disabled={notificationStarted}
                >
                  <Menu.Item
                    icon={<FieldTimeOutlined />}
                    onClick={restaurarPadrao}
                  >
                    Restaurar padrão
                  </Menu.Item>
                  <Menu.Item icon={<RestOutlined />} onClick={limparTodos}>
                    Limpar todos
                  </Menu.Item>
                </Menu.SubMenu>
              </Menu>
            </div>
            {notificationStarted && (
              <div className="nextEvent">
                <Row gutter={16}>
                  {nextEvents.map((nextEvent, index) => {
                    const cdKey = `${nextEvent[0]}-${nextEvent[1].toString()}`;
                    return (
                      <Col span={8} key={index}>
                        <Alert
                          message={
                            !eventDetails.hasOwnProperty(nextEvent[0]) ? (
                              nextEvent[0]
                            ) : (
                              <a href={eventDetails[nextEvent[0]]}>
                                {nextEvent[0]}
                              </a>
                            )
                          }
                          description={
                            <Countdown
                              key={cdKey}
                              date={nextEvent[1]}
                              intervalDelay={0}
                              precision={3}
                              renderer={({
                                hours,
                                minutes,
                                seconds,
                                completed,
                              }) =>
                                !completed ? (
                                  <div>
                                    próximo alerta em{" "}
                                    {hours.toString().padStart(2, "0")}:
                                    {minutes.toString().padStart(2, "0")}:
                                    {seconds.toString().padStart(2, "0")}{" "}
                                    minutos <br />
                                    {moment(nextEvent[1]).format(
                                      "DD/MM/YYYY HH:mm:ss"
                                    )}
                                  </div>
                                ) : (
                                  <div>Agora!</div>
                                )
                              }
                            />
                          }
                          type={index === 0 ? "success" : "warning"}
                        />
                      </Col>
                    );
                  })}

                  {/* <Col span={8}>
                  <Alert
                    message="Informational Notes"
                    description="Additional description and information about copywriting."
                    type="warning"
                  />
                </Col>
                <Col span={8}>
                  <Alert
                    message="Informational Notes"
                    description="Additional description and information about copywriting."
                    type="warning"
                  />
                </Col> */}
                </Row>
              </div>
            )}
            <Table
              loading={isLoading}
              className="event-list"
              columns={columns}
              dataSource={eventsSchedules}
              pagination={false}
            />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
