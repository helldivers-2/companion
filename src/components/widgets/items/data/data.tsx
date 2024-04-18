import { GiDwarfHelmet } from "react-icons/gi";
import { FaH, FaL, FaM, FaS, FaA } from "react-icons/fa6";

import { MdEngineering, MdMedicalServices } from "react-icons/md";
import { GiAbdominalArmor } from "react-icons/gi";
import { MdElectricalServices } from "react-icons/md";

export const types = [
  {
    value: "Heavy Armor",
    icon: FaH,
  },
  {
    value: "Medium Armor",
    icon: FaM,
  },
  {
    value: "Light Armor",
    icon: FaL,
  },
  {
    value: "Heavy",
    label: "Heavy Armor",
  },
  {
    value: "Medium",
    label: "Medium Armor",
  },
  {
    value: "Light",
    label: "Light Armor",
  },
  {
    value: "Helm",
    label: "Helm",
    icon: GiDwarfHelmet,
  },
];

export const passives = [
  {
    value: "ENGINEERING KIT",
    icon: MdEngineering,
  },
  {
    value: "STANDARD ISSUE",
    icon: FaS,
  },
  {
    value: "MED-KIT",
    icon: MdMedicalServices,
  },
  {
    value: "SERVO-ASSISTED",
    icon: FaA,
  },
  {
    value: "FORTIFIED",
    icon: GiAbdominalArmor,
  },
  {
    value: "ELECTRICAL CONDUIT",
    icon: MdElectricalServices,
  },
  {
    value: "Engineering Kit",
    label: "Engineering Kit",
  },
  {
    value: "Standard Issue",
    label: "Standard Issue",
  },
  {
    value: "Med-Kit",
    label: "Med-Kit",
  },
  {
    value: "Servo-Assisted",
    label: "Servo-Assisted",
  },
  {
    value: "Fortified",
    label: "Fortified",
  },
  {
    value: "Electrical Conduit",
    label: "Electrical Conduit",
  },
];
