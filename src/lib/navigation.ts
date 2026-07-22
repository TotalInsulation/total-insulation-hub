export type NavigateDetail = {
  tab: 'home' | 'onsite' | 'business' | 'crew' | 'team' | 'more';
  subTab?: string;
};

export function navigateTo(tab: NavigateDetail['tab'], subTab?: string) {
  window.dispatchEvent(new CustomEvent<NavigateDetail>('ti-navigate', { detail: { tab, subTab } }));
}
