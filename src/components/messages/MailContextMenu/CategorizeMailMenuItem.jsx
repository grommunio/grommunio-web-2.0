import { ListItemIcon, MenuItem } from "@mui/material";
import NestedMenuItem from "../../menu/NestedMenuItem";
import { useAppContext } from "../../../azure/AppContext";
import { withTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { patchMessageData } from "../../../actions/messages";
import { Sell } from "@mui/icons-material";


const CategorizeMailMenuItem = ({ t, openedMail }) => {
  const app = useAppContext();
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.messages);

  const handleCategorize = catId => () => {
    dispatch(patchMessageData({
      app,
      message: openedMail,
      specificProps: {
        categories: [
          ...openedMail.categories,
          catId,
        ]
      },
    }));
  }

  return <NestedMenuItem
    label={t("Categorize")}
  >
    {categories.map(({ id, displayName, color }, key) =>
      <MenuItem
        key={key}
        onClick={handleCategorize(id)}
      >
        <ListItemIcon>
          <Sell color="inherit" style={{ color }} /* TODO: Parse proper color */ />
        </ListItemIcon>
        {displayName}
      </MenuItem>
    )}
  </NestedMenuItem>;
}

export default withTranslation()(CategorizeMailMenuItem);