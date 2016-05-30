import React from 'react';
import Screen from '../../core/screen';
import SocialButtonsPane from '../../field/social/social_buttons_pane';
import LoginPane from '../../connection/database/login_pane';
import PaneSeparator from '../../core/pane_separator';
import {
  databaseConnection,
  defaultDatabaseConnection,
  hasScreen,
  signUpLink
} from '../../connection/database/index';
import { logIn as databaseLogIn } from '../../connection/database/actions';
import { renderSignedInConfirmation } from '../../core/signed_in_confirmation';
import LoginSignUpTabs from '../../connection/database/login_sign_up_tabs';
import * as l from '../../core/index';
import * as c from '../../field/index';
import { emailDomain } from '../../field/email';
import {
  logIn as enterpriseLogIn,
  startHRD
} from '../../connection/enterprise/actions';
import {
  defaultEnterpriseConnection,
  defaultEnterpriseConnectionName,
  findADConnectionWithoutDomain,
  isEnterpriseDomain,
  isHRDDomain
} from '../../connection/enterprise';
import SingleSignOnNotice from '../../connection/enterprise/single_sign_on_notice';
import {
  hasOnlyClassicConnections,
  isSSOEnabled,
  usernameStyle
} from '../automatic';


function shouldRenderTabs(m) {
  return l.hasSomeConnections(m, "database")
    && hasScreen(m, "signUp")
    && !isSSOEnabled(m);
}

const Component = ({i18n, model, t}) => {
  const sso = isSSOEnabled(model);
  const onlySocial = hasOnlyClassicConnections(model, "social");

  const tabs = shouldRenderTabs(model)
    && <LoginSignUpTabs
         key="loginsignup"
         lock={model}
         loginLabel={i18n.str("loginLabel")}
         signUpLink={signUpLink(model)}
         signUpLabel={i18n.str("signUpLabel")}
       />;


  const social = l.hasSomeConnections(model, "social")
    && <SocialButtonsPane
         instructions={i18n.html("socialLoginInstructions")}
         labelFn={i18n.str}
         lock={model}
         showLoading={onlySocial}
         signUp={false}
       />;

  const showPassword = !sso
    && (l.hasSomeConnections(model, "database")
       || !!findADConnectionWithoutDomain(model));

  const showForgotPasswordLink = showPassword
    && l.hasSomeConnections(model, "database");

  const loginInstructionsKey = social
    ? "databaseEnterpriseAlternativeLoginInstructions"
    : "databaseEnterpriseLoginInstructions";

  const login = (sso
    || l.hasSomeConnections(model, "database")
    || l.hasSomeConnections(model, "enterprise"))
    && <LoginPane
         emailInputPlaceholder={i18n.str("emailInputPlaceholder")}
         forgotPasswordAction={i18n.str("forgotPasswordAction")}
         instructions={i18n.html(loginInstructionsKey)}
         lock={model}
         passwordInputPlaceholder={i18n.str("passwordInputPlaceholder")}
         showForgotPasswordLink={showForgotPasswordLink}
         showPassword={showPassword}
         usernameInputPlaceholder={i18n.str("usernameInputPlaceholder")}
         usernameStyle={usernameStyle(model)}
       />;

  const ssoNotice = sso
    && <SingleSignOnNotice>
         {i18n.str("ssoEnabled")}
       </SingleSignOnNotice>;

  const separator = social && login && <PaneSeparator/>;

  return <div>{ssoNotice}{tabs}{social}{separator}{login}</div>;

};

export default class Login extends Screen {

  constructor() {
    super("main.login");
  }

  renderAuxiliaryPane(lock) {
    return renderSignedInConfirmation(lock);
  }

  renderTabs(model) {
    return shouldRenderTabs(model);
  }

  submitHandler(model) {
    if (hasOnlyClassicConnections(model, "social")) {
      return null;
    }

    if (isHRDDomain(model, c.email(model))) {
      return startHRD;
    }

    const useDatabaseConnection = !isSSOEnabled(model)
      && databaseConnection(model)
      && (defaultDatabaseConnection(model)
          || !defaultEnterpriseConnection(model));

    return useDatabaseConnection ? databaseLogIn : enterpriseLogIn;
  }

  render() {
    return Component;
  }

}
