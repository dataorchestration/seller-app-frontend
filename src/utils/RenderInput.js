import React, { useRef } from "react";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment'
import { isEmailValid, isPhoneNoValid } from "./validations";
import { getCall, postCall } from "../Api/axios";
import Cookies from "js-cookie";
import MyButton from "../Components/Shared/Button";
import PlacePickerMap from '../Components/PlacePickerMap/PlacePickerMap'
import axios from "axios";

const CssTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "black",
    },
    "&:hover fieldset": {
      borderColor: "#1c75bc",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1c75bc",
    },
  },
});

const RenderInput = ({ item, state, stateHandler, previewOnly }) => {
  const uploadFileRef = useRef(null)

  if (item.type == "input") {
    return (
      <div className="py-1 flex flex-col">
        <label className="text-sm py-2 ml-1 font-medium text-left text-[#606161] inline-block">
          {item.title}
          {item.required && <span className="text-[#FF0000]"> *</span>}
        </label>
        <CssTextField
          type={item.password ? "password" : "input"}
          className="w-full h-full px-2.5 py-3.5 text-[#606161] bg-transparent !border-black"
          required={item.required}
          size="small"
          autoComplete="off"
          placeholder={item.placeholder}
          error={item.error || false}
          disabled={item?.isDisabled || previewOnly || false}
          helperText={item.error && item.helperText}
          value={state[item.id]}
          onChange={(e) =>
            stateHandler({ ...state, [item.id]: e.target.value })
          }
          inputProps={{
            maxLength: item.maxLength || undefined,
            minLength: item.minLength || undefined,
          }}
        />
      </div>
    );
  } else if (item.type == "number") {
    return (
      <div className="py-1 flex flex-col">
        <label className="text-sm py-2 ml-1 font-medium text-left text-[#606161] inline-block">
          {item.title}
          {item.required && <span className="text-[#FF0000]"> *</span>}
        </label>
        <CssTextField
          type="number"
          className="w-full h-full px-2.5 py-3.5 text-[#606161] bg-transparent !border-black"
          required={item.required}
          size="small"
          InputProps={{ inputProps: { min: item.min || 0, max: item.max || 100000 } }}
          placeholder={item.placeholder}
          error={item.error || false}
          disabled={item?.isDisabled || previewOnly || false}
          helperText={item.error && item.helperText}
          value={state[item.id]}
          onChange={(e) =>
            stateHandler({ ...state, [item.id]: e.target.value })
          }
        />
      </div>
    );
  } else if (item.type == "radio") {
    return (
      <div className="py-1 flex flex-col">
        <FormControl component="fieldset">
          <label className="text-sm py-2 ml-1 font-medium text-left text-[#606161] inline-block">
            {item.title}
            {item.required && <span className="text-[#FF0000]"> *</span>}
          </label>
          <RadioGroup
            aria-label={item.id}
            name={item.id}
            value={state[item.id]}
            onChange={(e) =>
              stateHandler({ ...state, [item.id]: e.target.value })
            }
          >
            <div className="flex flex-row">
              {item.options.map((radioItem, i) => (
                <FormControlLabel
                  disabled={item?.isDisabled || previewOnly || false}
                  key={i}
                  value={radioItem.value}
                  control={<Radio size="small" />}
                  label={
                    <div className="text-sm font-medium text-[#606161]">
                      {radioItem.key}
                    </div>
                  }
                />
              ))}
            </div>
          </RadioGroup>
        </FormControl>
      </div>
    );
  } else if (item.type == "checkbox") {
    const onChange = (e) => {
      const val = e.target.name;
      const itemIndex = state[item.id].indexOf(val);
      if (itemIndex == -1) {
        stateHandler((prevState) => {
          const newState = {
            ...prevState,
            [item.id]: [...prevState[item.id], val],
          };
          return newState;
        });
      } else {
        stateHandler((prevState) => {
          const newState = {
            ...prevState,
            [item.id]: prevState[item.id].filter((ele) => ele != val),
          };
          return newState;
        });
      }
    };
    return (
      <div className="py-1 flex flex-col">
        <label className="text-sm py-2 ml-1 font-medium text-left text-[#606161] inline-block">
          {item.title}
          {item.required && <span className="text-[#FF0000]"> *</span>}
        </label>
        <FormGroup row>
          {item.options.map((checkboxItem) => (
            <FormControlLabel
              control={
                <Checkbox
                  disabled={item?.isDisabled || previewOnly || false}
                  key={checkboxItem.key}
                  onChange={onChange}
                  name={checkboxItem.value}
                  size="small"
                />
              }
              label={
                <div
                  className="text-sm font-medium text-[#606161]"
                  key={checkboxItem.key}
                >
                  {checkboxItem.key}
                </div>
              }
            />
          ))}
        </FormGroup>
      </div>
    );
  } else if (item.type == "select") {
    return (
      <div className="py-1 flex flex-col">
        <label className="text-sm py-2 ml-1 font-medium text-left text-[#606161] inline-block">
          {item.title}
          {item.required && <span className="text-[#FF0000]"> *</span>}
        </label>
        <FormControl error={item.error || false}>
          <Select
            disabled={item?.isDisabled || previewOnly || false}
            size="small"
            required={item.required}
            placeholder={item.placeholder}
            value={state[item.id]}
            onChange={(e) =>
              stateHandler({ ...state, [item.id]: e.target.value })
            }
          >
            <MenuItem value="none" disabled>
              <p className="text-[#606161]">None</p>
            </MenuItem>
            {item.options.map((selectItem, i) => (
              <MenuItem value={selectItem.value} key={i}>
                {selectItem.key}
              </MenuItem>
            ))}
          </Select>
          {item.error && <FormHelperText>{item.helperText}</FormHelperText>}
        </FormControl>
      </div>
    );
  } else if (item.type == "location-picker") {
    return (
      <div className="py-1 flex flex-col">
        <label className="text-sm py-2 ml-1 mb-1 font-medium text-left text-[#606161] inline-block">
          {item.title}
          {item.required && <span className="text-[#FF0000]"> *</span>}
        </label>
        <div style={{ width: '100%', height: '400px' }}>
          <PlacePickerMap location={state[item.id] ? {lat: state[item.id].lat, lng: state[item.id].long} : {}} setLocation={(location) => {
            const { city, state: stateVal, area: country, pincode: area_code, locality, lat, lng } = location
            stateHandler({
              ...state,
              [item.id]: {
                lat: lat,
                long: lng,
              },
              address_city: city,
              state: stateVal,
              country,
              area_code,
              locality
            })
          }} />
        </div>
      </div>
    );
  } else if (item.type == "date-picker") {
    return (
      <div className="py-1 flex flex-col">
        <label className="text-sm py-2 ml-1 mb-1 font-medium text-left text-[#606161] inline-block">
          {item.title}
          {item.required && <span className="text-[#FF0000]"> *</span>}
        </label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            format={item.format || "DD/MM/YYYY"}
            view={['year', 'month']}
            onChange={(newValue) => {
              const date = moment(newValue).format(item.format || 'DD/MM/YYYY').toString();
              stateHandler((prevState) => {
                const newState = {
                  ...prevState,
                  [item.id]: date,
                };
                return newState;
              });
            }}
          />
        </LocalizationProvider>
      </div>
    );
  } else if (item.type == "multi-select") {
    return (
      <div className="py-1 flex flex-col">
        <label className="text-sm py-2 ml-1 mb-1 font-medium text-left text-[#606161] inline-block">
          {item.title}
          {item.required && <span className="text-[#FF0000]"> *</span>}
        </label>
        <FormControl>
          <Autocomplete
            disabled={item?.isDisabled || previewOnly || false}
            multiple
            // filterSelectedOptions
            size="small"
            options={item.options}
            getOptionLabel={(option) => option.key}
            value={state[item.id]}
            onChange={(event, newValue) => {
              stateHandler((prevState) => {
                const newState = {
                  ...prevState,
                  [item.id]: newValue,
                };
                return newState;
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={item.placeholder}
                variant="outlined"
                error={item.error || false}
                helperText={item.error && item.helperText}
              />
            )}
          />
        </FormControl>
      </div>
    );
  } else if (item.type == "upload") {
    const getSignUrl = async (file) => {
      const url = `/api/v1/upload/${item?.file_type}`;
      const file_type = file.type.split("/")[1];
      const data = {
        fileName: file.name.replace(`\.${file_type}`, ""),
        fileType: file_type,
      };
      const res = await postCall(url, data);
      return res;
    };

    const renderUploadedUrls = () => {
      if (state?.uploaded_urls) {
        return state?.uploaded_urls?.map((url) => {
          return (
            <img src={url} height={50} width={50} style={{ margin: "10px" }} />
          );
        });
      }
    };

    if (previewOnly) {
      if (typeof state[item.id] == "string") {
        return (
          <div
            style={{ height: 100, width: 100, marginBottom: 40, marginTop: 10 }}
          >
            <label
              className="text-sm py-2 ml-1 font-medium text-left text-[#606161] inline-block"
              style={{ width: 200 }}
            >
              {item.title}
            </label>
            <img className="ml-1 h-full w-full" src={state[item.id]} />
          </div>
        );
      } else {
        return (
          <div
            style={{ height: 100, width: 100, marginBottom: 40, marginTop: 10 }}
            className="flex"
          >
            <label className="text-sm py-2 ml-1 font-medium text-left text-[#606161] inline-block">
              {item.title}
            </label>
            {state[item.id]?.map((img_url) => (
              <img className="ml-1 h-full w-full" key={img_url} src={img_url} />
            ))}
          </div>
        );
      }
    }

    return (
      <div className="py-1 flex flex-col">
        <label for="contained-button-file" className="text-sm py-2 ml-1 font-medium text-left text-[#606161] inline-block">
          {item.title}
          {item.required && <span className="text-[#FF0000]"> *</span>}
        </label>
        <div style={{ display: "flex" }}>{renderUploadedUrls()}</div>
        <FormControl error={item.error}>
        {/* <label htmlFor="contained-button-file"> */}
          <input
            ref={uploadFileRef}
            id="contained-button-file"
            name="contained-button-file"
            style={{ opacity: "none", marginBottom: 10 }}
            accept="image/*"
            type="file"
            multiple={item?.multiple || false}
            key={item?.id}
            onChange={(e) => {
              const token = Cookies.get("token");
              for (const file of e.target.files) {
                const formData = new FormData();
                formData.append("file", file);
                getSignUrl(file).then((d) => {
                  const url = d.urls;

                  axios(url, {
                    method: "PUT",
                    data: file,
                    headers: {
                      ...(token && { "access-token": `Bearer ${token}` }),
                      "Content-Type": "multipart/form-data",
                    },
                  })
                    .then((response) => {
                      if (item.multiple) {
                        stateHandler((prevState) => {
                          const newState = {
                            ...prevState,
                            [item.id]: [...prevState[item.id], d.path],
                            uploaded_urls: [],
                          };
                          return newState;
                        });
                      } else {
                        stateHandler({
                          ...state,
                          [item.id]: d.path,
                          uploaded_urls: [],
                        });
                      }
                      response.json();
                    })
                    .then((json) => {});
                });
              };
            }}
          />
          {item.multiple &&
            state[item.id].map((name) => {
              return (
                <div className="flex">
                  <Button
                    size="small"
                    className="w-10 mr-2 !text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      // reset file input 
                      uploadFileRef.current.value = null
                      stateHandler((prevState) => {
                        const newState = {
                          ...prevState,
                          [item.id]: prevState[item.id].filter(
                            (ele) => ele != name
                          ),
                          uploaded_urls: [],
                        };
                        return newState;
                      });
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 20 }} />
                  </Button>
                  <p className="text-sm mt-1 ml-2">{name}</p>
                </div>
              );
            })}
            {item.error && <FormHelperText>{item.helperText}</FormHelperText>}
        {/* </label> */}
        </FormControl>
      </div>
    );
  }
};

export default RenderInput;
